"use client";

import React from "react";
import { Database, Network, Brain, ShieldCheck, Zap } from "lucide-react";

interface StatsOverviewProps {
  totalNodes: number;
  totalEdges: number;
  totalMemories: number;
  avgConfidence: string;
  avgLatency: string;
}

export default function StatsOverview({
  totalNodes,
  totalEdges,
  totalMemories,
  avgConfidence,
  avgLatency,
}: StatsOverviewProps) {
  const stats = [
    {
      label: "Connected Nodes",
      value: totalNodes,
      icon: Database,
      accent: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      detail: "Services, People, Policies, Incidents",
    },
    {
      label: "Relational Edges",
      value: totalEdges,
      icon: Network,
      accent: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      detail: "Directed Cypher relationships",
    },
    {
      label: "Persistent Memories",
      value: totalMemories,
      icon: Brain,
      accent: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      detail: "Cross-session context anchors",
    },
    {
      label: "Decision Traceability",
      value: avgConfidence,
      icon: ShieldCheck,
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      detail: "Grounding in verified subgraphs",
    },
    {
      label: "Query Latency",
      value: avgLatency,
      icon: Zap,
      accent: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      detail: "FalkorDB in-memory performance",
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border backdrop-blur-md bg-slate-900/60 transition-all hover:bg-slate-900/90 ${s.bg}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                {s.label}
              </span>
              <Icon className={`w-4 h-4 ${s.accent}`} />
            </div>
            <div className={`text-2xl font-extrabold tracking-tight ${s.accent}`}>
              {s.value}
            </div>
            <p className="text-[10px] text-slate-500 mt-1 truncate">{s.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
