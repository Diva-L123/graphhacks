"use client";

import React from "react";
import { Network, Brain, ShieldCheck } from "lucide-react";

export type PillarType = "connect" | "memory" | "traceability";

interface PillarTabsProps {
  activePillar: PillarType;
  onChange: (pillar: PillarType) => void;
}

export default function PillarTabs({ activePillar, onChange }: PillarTabsProps) {
  const pillars: {
    id: PillarType;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
    badge: string;
  }[] = [
    {
      id: "connect",
      title: "1. Connect Data",
      subtitle: "Relational context across complex enterprise entities & graph topologies",
      icon: Network,
      accent: "cyan",
      badge: "Relational Reasoning",
    },
    {
      id: "memory",
      title: "2. Persistent Memory",
      subtitle: "Preserves state, decisions, and preferences across sessions via FalkorDB",
      icon: Brain,
      accent: "purple",
      badge: "Cross-Session Continuity",
    },
    {
      id: "traceability",
      title: "3. Ensure Traceability",
      subtitle: "100% auditable Cypher decision paths with step-by-step cryptographic proof",
      icon: ShieldCheck,
      accent: "emerald",
      badge: "Auditable Grounding",
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      {pillars.map((p) => {
        const Icon = p.icon;
        const isActive = activePillar === p.id;

        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className={`p-5 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
              isActive
                ? p.id === "connect"
                  ? "bg-cyan-950/40 border-cyan-500 shadow-xl shadow-cyan-500/10"
                  : p.id === "memory"
                  ? "bg-purple-950/40 border-purple-500 shadow-xl shadow-purple-500/10"
                  : "bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/10"
                : "bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2.5 rounded-xl border ${
                  isActive
                    ? p.id === "connect"
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                      : p.id === "memory"
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  isActive
                    ? p.id === "connect"
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                      : p.id === "memory"
                      ? "bg-purple-950 text-purple-300 border border-purple-500/30"
                      : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-400 border border-slate-700"
                }`}
              >
                {p.badge}
              </span>
            </div>

            <h3
              className={`text-sm font-bold transition-colors ${
                isActive
                  ? p.id === "connect"
                    ? "text-cyan-300"
                    : p.id === "memory"
                    ? "text-purple-300"
                    : "text-emerald-300"
                  : "text-slate-100 group-hover:text-white"
              }`}
            >
              {p.title}
            </h3>

            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.subtitle}</p>

            {isActive && (
              <div
                className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full ${
                  p.id === "connect"
                    ? "bg-cyan-400"
                    : p.id === "memory"
                    ? "bg-purple-400"
                    : "bg-emerald-400"
                }`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
