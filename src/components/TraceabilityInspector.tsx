"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AgentDecisionTrace, ReasoningStep } from "@/lib/mock-graph-data";
import { ShieldCheck, Play, Pause, Check, GitCommit, ArrowRight, Code, KeyRound, ExternalLink } from "lucide-react";

interface TraceabilityInspectorProps {
  trace: AgentDecisionTrace | null;
  onSelectStep?: (step: ReasoningStep | null) => void;
  onHighlightEntities?: (nodeIds: string[], edgeIds: string[]) => void;
}

export default function TraceabilityInspector({
  trace,
  onSelectStep,
  onHighlightEntities,
}: TraceabilityInspectorProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlayingReplay, setIsPlayingReplay] = useState(false);

  useEffect(() => {
    setActiveStepIndex(0);
  }, [trace?.traceId]);

  // Replay reasoning animation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingReplay && trace?.reasoningPath) {
      timer = setTimeout(() => {
        if (activeStepIndex < trace.reasoningPath.length - 1) {
          const nextIdx = activeStepIndex + 1;
          setActiveStepIndex(nextIdx);
          const step = trace.reasoningPath[nextIdx];
          if (onSelectStep) onSelectStep(step);
          if (onHighlightEntities) onHighlightEntities(step.activatedNodes, step.activatedEdges);
        } else {
          setIsPlayingReplay(false);
        }
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isPlayingReplay, activeStepIndex, trace]);

  if (!trace) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-8 text-center text-slate-400">
        <ShieldCheck className="w-10 h-10 mx-auto text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">No Active Decision Trace</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Execute a query in the console to inspect the complete step-by-step FalkorDB reasoning path.
        </p>
      </div>
    );
  }

  const handleStepClick = (idx: number) => {
    setActiveStepIndex(idx);
    setIsPlayingReplay(false);
    const step = trace.reasoningPath[idx];
    if (onSelectStep) onSelectStep(step);
    if (onHighlightEntities) onHighlightEntities(step.activatedNodes, step.activatedEdges);
  };

  const currentStep = trace.reasoningPath[activeStepIndex];

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Auditable Traceability Engine</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                100% Provenance
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically auditable chain of thought grounded in FalkorDB subgraphs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isPlayingReplay) {
                setIsPlayingReplay(false);
              } else {
                setActiveStepIndex(0);
                setIsPlayingReplay(true);
                const firstStep = trace.reasoningPath[0];
                if (onSelectStep) onSelectStep(firstStep);
                if (onHighlightEntities) onHighlightEntities(firstStep.activatedNodes, firstStep.activatedEdges);
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
          >
            {isPlayingReplay ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Replay</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Replay Graph Path</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Trace Metadata Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Trace Hash</span>
          <span className="text-xs font-mono font-bold text-cyan-300 truncate block mt-0.5">
            {trace.traceId}
          </span>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Grounding Score</span>
          <span className="text-xs font-mono font-bold text-emerald-400 block mt-0.5">
            {(trace.groundingScore * 100).toFixed(1)}% Verified
          </span>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Algorithm</span>
          <span className="text-xs font-mono font-bold text-cyan-300 truncate block mt-0.5" title={trace.graphAlgorithm}>
            {trace.graphAlgorithm?.split(" ")[0] || "GraphBLAS"}
          </span>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">Graph Traversal Hops</span>
          <span className="text-xs font-mono font-bold text-purple-300 block mt-0.5">
            {trace.reasoningPath.length} Multi-Hop Stages
          </span>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block uppercase">FalkorDB Exec Time</span>
          <span className="text-xs font-mono font-bold text-amber-300 block mt-0.5">
            {trace.falkorLatencyMs} ms
          </span>
        </div>
      </div>

      {/* Step Stepper Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Step-by-Step Traversal Chain:
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Stage {activeStepIndex + 1} of {trace.reasoningPath.length}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {trace.reasoningPath.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={step.step}
                onClick={() => handleStepClick(idx)}
                className={`flex-1 min-w-[160px] p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-cyan-950/70 border-cyan-500 shadow-md shadow-cyan-500/20"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    Hop {step.step}
                  </span>
                  <Check className={`w-3 h-3 ${isSelected ? "text-cyan-400" : "text-slate-600"}`} />
                </div>
                <h5 className="text-xs font-semibold text-slate-200 truncate">{step.title}</h5>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Detailed View */}
      {currentStep && (
        <motion.div
          key={currentStep.step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/90 rounded-xl p-5 border border-cyan-500/30 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                Stage {currentStep.step} Reasoning & Evidence
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">{currentStep.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentStep.explanation}</p>
            </div>
          </div>

          {/* Cypher Query for this specific step */}
          {currentStep.cypherQuery && (
            <div className="bg-slate-950 rounded-lg p-3 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1 font-semibold">
                  <Code className="w-3 h-3" />
                  Cypher Traversal Query
                </span>
                <span className="text-[10px] font-mono text-slate-500">openCypher Standard</span>
              </div>
              <code className="text-xs font-mono text-emerald-300 block overflow-x-auto whitespace-pre-wrap">
                {currentStep.cypherQuery}
              </code>
            </div>
          )}

          {/* Activated Subgraph Nodes */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Activated Nodes in Subgraph:</span>
            {currentStep.activatedNodes.map((nId) => (
              <span
                key={nId}
                className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[11px]"
              >
                {nId}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Cryptographic Trace Proof Footer */}
      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Auditable Proof:</span>
          <span className="text-slate-400">
            {trace.auditableGraphProof.rootEntities.join(" → ")} → ... →{" "}
            <strong className="text-cyan-300">{trace.auditableGraphProof.terminalConclusion}</strong>
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
          Verified by FalkorDB Graph Schema
        </span>
      </div>
    </div>
  );
}
