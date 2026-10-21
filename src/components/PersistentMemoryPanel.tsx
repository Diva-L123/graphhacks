"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraphNode, GraphEdge } from "@/lib/mock-graph-data";
import {
  Brain,
  PlusCircle,
  Calendar,
  Link2,
  Sparkles,
  Database,
  Check,
  History,
  GitCompare,
  ArrowRight,
  ShieldCheck,
  Layers,
  HelpCircle,
} from "lucide-react";

interface PersistentMemoryPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onMemoryAdded: (node: GraphNode, edges: GraphEdge[]) => void;
}

export default function PersistentMemoryPanel({
  nodes,
  edges,
  onMemoryAdded,
}: PersistentMemoryPanelProps) {
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [memoryLabel, setMemoryLabel] = useState("");
  const [memoryDetails, setMemoryDetails] = useState("");
  const [targetNodeId, setTargetNodeId] = useState("srv_auth");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSessionFilter, setSelectedSessionFilter] = useState("all");

  const memoryNodes = nodes.filter((n) => n.type === "SessionMemory");
  const sessionNodes = nodes.filter((n) => n.type === "Session");

  const filteredMemories = memoryNodes.filter((m) => {
    if (selectedSessionFilter === "all") return true;
    return m.sessionOrigin?.toLowerCase().includes(selectedSessionFilter.toLowerCase());
  });

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryLabel.trim() || !memoryDetails.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/falkordb/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: `Session 3 (Live)`,
          label: memoryLabel,
          details: memoryDetails,
          relatedNodeIds: [targetNodeId],
        }),
      });
      const data = await res.json();
      if (data.success && data.memoryNode) {
        onMemoryAdded(data.memoryNode, data.newEdges || []);
        setMemoryLabel("");
        setMemoryDetails("");
        setIsAddingMemory(false);
      }
    } catch (err) {
      console.error("Failed to add memory", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Cross-Session Persistent Memory</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                Pillar B Core Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Overcomes stateless LLM limitations by retaining entity state, user decisions, and preferences across sessions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingMemory(!isAddingMemory)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-purple-600/20 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Inject Persistent Memory</span>
        </button>
      </div>

      {/* Pillar B Showcase Highlights: Cross-Session Recall & Contradiction Handling */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cross-Session Recall Demonstration Box */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-purple-300 uppercase flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-purple-400" />
              Cross-Session Recall Demonstration
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
              Verified
            </span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-cyan-400 block font-bold">SESSION 1 (FACT INGESTION):</span>
              <span>&ldquo;Team Alpha owns microservice Auth-V2 and reports directly to Sarah Connor.&rdquo;</span>
            </div>
            <div className="text-center text-slate-500 font-mono text-[10px]">↓ Retained across sessions in FalkorDB ↓</div>
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-emerald-400 block font-bold">SESSION 2 (QUERY RECALL):</span>
              <span>&ldquo;Who should be alerted if Auth-V2 fails?&rdquo; → Resolves to <strong>Sarah Connor (VP Eng)</strong></span>
            </div>
          </div>
        </div>

        {/* Episodic vs Semantic Memory Organization Box */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Episodic vs. Semantic Memory Organization
            </span>
            <span className="text-[10px] font-mono text-slate-500">Bipartite Schema</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            FalkorDB stores <strong className="text-purple-300">Episodic Memory</strong> (raw conversation turns,
            user sessions, and temporal events) linked to <strong className="text-cyan-300">Semantic Memory</strong> (crystallized
            knowledge entities and evergreen relational edges). This prevents context window decay while maintaining full auditability.
          </p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
            <span>Episodic Sessions: <strong className="text-purple-300">{sessionNodes.length}</strong></span>
            <span>•</span>
            <span>Crystallized Facts: <strong className="text-cyan-300">{memoryNodes.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Add Memory Inline Drawer */}
      <AnimatePresence>
        {isAddingMemory && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddMemory}
            className="bg-purple-950/30 border border-purple-500/40 rounded-xl p-5 space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Store New Fact into FalkorDB Persistent Knowledge Graph
              </h4>
              <span className="text-[11px] font-mono text-purple-400">Session Origin: Session 3 (Live)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Memory Label / Title</label>
                <input
                  type="text"
                  required
                  value={memoryLabel}
                  onChange={(e) => setMemoryLabel(e.target.value)}
                  placeholder="e.g., Security Mandate: Token Expiry lowered to 5m"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Link Relational Edge To Node</label>
                <select
                  value={targetNodeId}
                  onChange={(e) => setTargetNodeId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                >
                  {nodes
                    .filter((n) => n.type !== "SessionMemory")
                    .map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label} ({n.type})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Detailed Context / Fact Reasoning</label>
              <textarea
                required
                rows={2}
                value={memoryDetails}
                onChange={(e) => setMemoryDetails(e.target.value)}
                placeholder="Explain the persistent rule or action that future AI agent sessions must remember..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-purple-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingMemory(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isSubmitting ? "Writing to FalkorDB..." : "Persist Memory Node"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Memory Timeline List */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">
            Persistent Knowledge Graph Memory Nodes ({filteredMemories.length})
          </span>

          {/* Session filter tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
            {["all", "Session 1", "Session 2", "Session 3"].map((sf) => (
              <button
                key={sf}
                onClick={() => setSelectedSessionFilter(sf)}
                className={`px-2 py-0.5 rounded-lg transition-colors ${
                  selectedSessionFilter === sf
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sf === "all" ? "All Sessions" : sf}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filteredMemories.map((mem) => {
            const connectedEdges = edges.filter(
              (e) => e.source === mem.id || e.target === mem.id
            );
            const connectedNodes = connectedEdges.map((e) => {
              const otherId = e.source === mem.id ? e.target : e.source;
              return nodes.find((n) => n.id === otherId);
            });

            return (
              <div
                key={mem.id}
                className="bg-slate-900/80 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {mem.sessionOrigin}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">ID: {mem.id}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white mb-1">{mem.label}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {mem.properties.note || mem.properties.statement || mem.properties.details}
                  </p>
                </div>

                <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1 font-mono">
                    <Link2 className="w-3 h-3 text-purple-400" />
                    Edges:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {connectedNodes.map((cn) => (
                      <span
                        key={cn?.id}
                        className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px]"
                      >
                        {cn?.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
