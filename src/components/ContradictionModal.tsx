"use client";

import React, { useState } from "react";
import { X, RefreshCw, AlertTriangle, ArrowRight, CheckCircle2, GitCompare, Database, Sparkles } from "lucide-react";

interface ContradictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContradictionResolved: (snapshot: any) => void;
}

export default function ContradictionModal({
  isOpen,
  onClose,
  onContradictionResolved,
}: ContradictionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cypherExecuted, setCypherExecuted] = useState<string>("");

  if (!isOpen) return null;

  const handleExecuteContradiction = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/falkordb/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "contradict",
          oldEntityId: "srv_auth_v2",
          newEntityId: "srv_auth_v3",
          subjectId: "team_alpha",
          relationship: "OWNS",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsCompleted(true);
        setCypherExecuted(
          "MATCH (t:Team {id: 'team_alpha'})-[r:OWNS]->(old:Service {id: 'srv_auth_v2'}) SET r.status = 'superseded', old.status = 'Deprecated' CREATE (old)-[:SUPERSEDED_BY {timestamp: timestamp()}]->(new:Service {id: 'srv_auth_v3'}), (t)-[:OWNS {status: 'active'}]->(new) RETURN old, new;"
        );
        if (onContradictionResolved && data.snapshot) {
          onContradictionResolved(data.snapshot);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Contradiction & Update Handling
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                  Pillar B Demonstration
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Demonstrates non-destructive fact supersession in FalkorDB persistent memory
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

        {/* Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Explanation Banner */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <span className="text-purple-400 font-bold flex items-center gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              The LLM Contradiction Problem:
            </span>
            <p className="text-slate-400 leading-relaxed">
              When a user contradicts an earlier claim (e.g. replacing a service), naive RAG models retrieve both
              conflicting facts and hallucinate. FalkorDB handles this deterministically by marking the old edge
              as <code className="text-purple-300">status: superseded</code> and establishing a verified{" "}
              <code className="text-cyan-300">[:SUPERSEDED_BY]</code> lineage edge.
            </p>
          </div>

          {/* Before & After Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                Session 1 Fact State
              </span>
              <div className="font-mono text-[11px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800">
                (Team Alpha) -[:OWNS]-&gt; (Auth-V2)
              </div>
              <span className="text-[11px] text-slate-400 block">Status: Active prior baseline</span>
            </div>

            <div className="p-3 bg-purple-950/30 rounded-xl border border-purple-500/30 space-y-2">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold block">
                New User Assertion (Update)
              </span>
              <div className="font-mono text-[11px] text-purple-200 bg-slate-900 p-2 rounded border border-purple-500/30">
                &ldquo;Actually, Auth-V2 is deprecated; replaced by Auth-V3&rdquo;
              </div>
              <span className="text-[11px] text-emerald-400 block">Requires: Edge supersession</span>
            </div>
          </div>

          {/* Action or Result */}
          {!isCompleted ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleExecuteContradiction}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mutating FalkorDB Graph Topology...</span>
                  </>
                ) : (
                  <>
                    <GitCompare className="w-4 h-4" />
                    <span>Execute Fact Update in FalkorDB</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-emerald-300 text-xs">Contradiction Handled Successfully!</h5>
                  <p className="text-slate-300 text-[11px] mt-0.5">
                    1. Old edge marked <span className="text-amber-400 font-mono">superseded</span> (crimson dashed on canvas).
                    <br />
                    2. Auth-V2 flagged as <span className="text-amber-400 font-mono">Deprecated</span>.
                    <br />
                    3. Created <span className="text-cyan-300 font-mono">[:SUPERSEDED_BY]</span> edge to Auth-V3.
                    <br />
                    4. New active <span className="text-emerald-300 font-mono">[:OWNS]</span> edge established to Auth-V3.
                  </p>
                </div>
              </div>

              {cypherExecuted && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                  {cypherExecuted}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
          >
            {isCompleted ? "View in Graph Canvas" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
