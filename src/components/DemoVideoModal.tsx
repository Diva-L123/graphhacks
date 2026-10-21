"use client";

import React, { useState } from "react";
import { X, Play, Video, ExternalLink, Sparkles, CheckCircle2, Clock } from "lucide-react";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const [activeChapter, setActiveChapter] = useState(0);

  if (!isOpen) return null;

  const chapters = [
    {
      title: "1. Problem Statement & Dual Workspace",
      duration: "0:45",
      description: "Overview of stateless agent limitations and the unified interactive graph + execution console layout.",
    },
    {
      title: "2. Pillar A: Relational Reasoning & Blast Radius",
      duration: "0:50",
      description: "Multi-hop graph traversal through Auth Gateway and CVE vulnerability during EU payment incident.",
    },
    {
      title: "3. Pillar B: Cross-Session Persistent Memory",
      duration: "0:48",
      description: "Session 1 facts (Team Alpha owns Auth-V2, reports to Sarah) recalled in Session 2, plus contradiction handling.",
    },
    {
      title: "4. Pillar C: Traceability & Cryptographic Proof",
      duration: "0:42",
      description: "Zero-hallucination guarantee through openCypher step provenance and sub-millisecond execution metrics.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Hackathon Demo Walkthrough
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
                  3-Minute Video
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Judges evaluation video showcasing the 3 Problem Statement Pillars
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

        {/* Video Player Mockup / Embed */}
        <div className="p-6 space-y-4">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col items-center justify-center group shadow-2xl">
            <video
              src="/graph-loop.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Play Button Overlay */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  FalkorDB Cognitive Agent: Submission Walkthrough
                </h4>
                <p className="text-xs text-cyan-300 font-mono mt-0.5">
                  Length: 3:05 • 1080p 60fps • Narration & Live Walkthrough
                </p>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                Chapter: {chapters[activeChapter]?.title}
              </span>
              <span>0:00 / 3:05</span>
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Demo Chapters for Hackathon Evaluation:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chapters.map((ch, idx) => {
                const isSelected = activeChapter === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveChapter(idx)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-purple-950/50 border-purple-500/50 text-purple-200"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                      <span className="font-bold text-white">{ch.title}</span>
                      <span className="text-slate-500">{ch.duration}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{ch.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <a
            href="https://github.com/FalkorDB/FalkorDB"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1.5 font-mono"
          >
            <span>Powered by FalkorDB Graph Engine</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
