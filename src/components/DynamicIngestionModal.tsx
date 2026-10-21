"use client";

import React, { useState } from "react";
import { X, Plus, Sparkles, Database, Link2, Code, CheckCircle2, FileText } from "lucide-react";
import { GraphNode, GraphEdge, NodeType } from "@/lib/mock-graph-data";

interface DynamicIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingNodes: GraphNode[];
  onEntityAdded: (newNode: GraphNode, newEdge?: GraphEdge) => void;
}

export default function DynamicIngestionModal({
  isOpen,
  onClose,
  existingNodes,
  onEntityAdded,
}: DynamicIngestionModalProps) {
  const [ingestionMode, setIngestionMode] = useState<"structured" | "document">("structured");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<NodeType>("Service");
  const [propKey, setPropKey] = useState("environment");
  const [propVal, setPropVal] = useState("Production");
  const [targetNodeId, setTargetNodeId] = useState(existingNodes[0]?.id || "srv_auth");
  const [relationship, setRelationship] = useState("DEPENDS_ON");
  const [documentText, setDocumentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cypherPreview, setCypherPreview] = useState("");

  if (!isOpen) return null;

  const handleStructuredSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/falkordb/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addEntity",
          label: label.trim(),
          type,
          properties: { [propKey.trim() || "status"]: propVal.trim() || "Active" },
          targetNodeId,
          relationship: relationship.toUpperCase().replace(/\s+/g, "_"),
          sessionOrigin: "Session 3 (Live Ingestion)",
        }),
      });

      const data = await res.json();
      if (data.success && data.node) {
        onEntityAdded(data.node, data.edge);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentText.trim()) return;

    setIsSubmitting(true);
    try {
      // Natural language ingestion simulation
      const extractedLabel = documentText.slice(0, 32);
      const res = await fetch("/api/falkordb/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addEntity",
          label: extractedLabel,
          type: "SessionMemory",
          properties: {
            extractedText: documentText,
            extractedAt: new Date().toISOString(),
            confidence: 0.99,
          },
          targetNodeId: targetNodeId || "srv_auth",
          relationship: "REMEMBERS_CONTEXT_ABOUT",
          sessionOrigin: "Session 3 (Document Ingest)",
        }),
      });

      const data = await res.json();
      if (data.success && data.node) {
        onEntityAdded(data.node, data.edge);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const typesList: NodeType[] = [
    "Service",
    "Team",
    "Person",
    "Policy",
    "Vulnerability",
    "SessionMemory",
  ];

  const relationList = [
    "DEPENDS_ON",
    "OWNS",
    "AUTHENTICATES_VIA",
    "REPORTS_TO",
    "GOVERNED_BY",
    "MONITORS",
    "RESOLVES",
    "CONNECTED_TO",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Dynamic Graph Ingestion
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Immediate Edge Creation
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Add custom entities, documents, or facts to observe real-time topology mutation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 text-xs font-medium">
          <button
            type="button"
            onClick={() => setIngestionMode("structured")}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              ingestionMode === "structured"
                ? "border-cyan-400 text-cyan-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Structured Entity & Edge
          </button>
          <button
            type="button"
            onClick={() => setIngestionMode("document")}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              ingestionMode === "document"
                ? "border-cyan-400 text-cyan-300 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Document / Natural Language
          </button>
        </div>

        {/* Form Body */}
        {ingestionMode === "structured" ? (
          <form onSubmit={handleStructuredSubmit} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Entity Label</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Kafka Stream Ingest v1.2"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Node Class / Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NodeType)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg px-3 py-2 text-white focus:outline-none"
                >
                  {typesList.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Properties row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Custom Property Key</label>
                <input
                  type="text"
                  value={propKey}
                  onChange={(e) => setPropKey(e.target.value)}
                  placeholder="e.g. cluster"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Property Value</label>
                <input
                  type="text"
                  value={propVal}
                  onChange={(e) => setPropVal(e.target.value)}
                  placeholder="e.g. us-east-prod"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 text-xs"
                />
              </div>
            </div>

            {/* Edge Connection Section */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="text-[11px] font-mono text-cyan-400 font-bold block flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                Connect Relational Edge in FalkorDB:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Target Existing Node</label>
                  <select
                    value={targetNodeId}
                    onChange={(e) => setTargetNodeId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                  >
                    {existingNodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Relationship Type</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-cyan-300 font-mono text-xs"
                  >
                    {relationList.map((r) => (
                      <option key={r} value={r}>
                        [:{r}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Generated Cypher Preview */}
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-emerald-300 flex items-center gap-2 overflow-x-auto">
              <Code className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="whitespace-nowrap">
                {`CREATE (n:${type} {label: '${label || "..."}'})-[r:${relationship}]->(target) RETURN n, r`}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !label.trim()}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Writing to FalkorDB..." : "Ingest Entity & Edge"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleDocumentSubmit} className="p-6 space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">
                Document / Unstructured Fact Text
              </label>
              <textarea
                required
                rows={4}
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                placeholder="e.g. Architecture Note: Redis cluster failover mode was enabled during maintenance. Marcus validated cache sync with Auth Gateway."
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none resize-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                FalkorDB will ingest this text, construct a SessionMemory node, and form semantic edges to relevant entities.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !documentText.trim()}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Ingesting..." : "Crystallize Memory into Graph"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
