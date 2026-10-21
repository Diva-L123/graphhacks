"use client";

import React, { useState, useEffect } from "react";
import InteractiveVideoHero from "@/components/InteractiveVideoHero";
import Navigation from "@/components/Navigation";
import StatsOverview from "@/components/StatsOverview";
import PillarTabs, { PillarType } from "@/components/PillarTabs";
import GraphVisualizer from "@/components/GraphVisualizer";
import AgentChatConsole from "@/components/AgentChatConsole";
import TraceabilityInspector from "@/components/TraceabilityInspector";
import PersistentMemoryPanel from "@/components/PersistentMemoryPanel";
import ArchitectureModal from "@/components/ArchitectureModal";
import DemoVideoModal from "@/components/DemoVideoModal";
import DynamicIngestionModal from "@/components/DynamicIngestionModal";
import ContradictionModal from "@/components/ContradictionModal";
import {
  GraphNode,
  GraphEdge,
  AgentDecisionTrace,
  ReasoningStep,
  DEMO_PRESET_SCENARIOS,
} from "@/lib/mock-graph-data";
import {
  Sparkles,
  Terminal,
  Database,
  CheckCircle2,
  GitCompare,
  Plus,
  Play,
  Github,
  Video,
  ExternalLink,
  Layers,
  ArrowRight,
  Activity,
  Brain,
  Users,
  ShieldAlert,
  Network,
} from "lucide-react";

export default function Home() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [activePillar, setActivePillar] = useState<PillarType>("connect");
  const [activeTrace, setActiveTrace] = useState<AgentDecisionTrace | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [highlightedEdgeIds, setHighlightedEdgeIds] = useState<string[]>([]);
  const [activeCypher, setActiveCypher] = useState<string | undefined>(undefined);
  const [isResetting, setIsResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isDemoVideoModalOpen, setIsDemoVideoModalOpen] = useState(false);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [isContradictionModalOpen, setIsContradictionModalOpen] = useState(false);

  // Session & User profile states (Pillar B)
  const [currentSessionId, setCurrentSessionId] = useState("sess_3");
  const [currentUserProfile, setCurrentUserProfile] = useState("DevOps Incident Commander");

  // Fetch graph state
  const loadGraph = async () => {
    try {
      const res = await fetch("/api/falkordb/query");
      const json = await res.json();
      if (json.success && json.data) {
        setNodes(json.data.nodes);
        setEdges(json.data.edges);
      }
    } catch (err) {
      console.error("Failed to load graph data", err);
    }
  };

  useEffect(() => {
    loadGraph();
    // Default to first scenario
    const defaultScenario = DEMO_PRESET_SCENARIOS[0];
    if (defaultScenario) {
      setActiveTrace(defaultScenario.trace);
      const allActiveNodes = defaultScenario.trace.reasoningPath.flatMap((s) => s.activatedNodes);
      const allActiveEdges = defaultScenario.trace.reasoningPath.flatMap((s) => s.activatedEdges);
      setHighlightedNodeIds(Array.from(new Set(allActiveNodes)));
      setHighlightedEdgeIds(Array.from(new Set(allActiveEdges)));
      setActiveCypher(defaultScenario.trace.cypherQuery || defaultScenario.trace.reasoningPath[0]?.cypherQuery);
    }
  }, []);

  const handleTraceGenerated = (trace: AgentDecisionTrace) => {
    setActiveTrace(trace);
    const allActiveNodes = trace.reasoningPath.flatMap((s) => s.activatedNodes);
    const allActiveEdges = trace.reasoningPath.flatMap((s) => s.activatedEdges);
    setHighlightedNodeIds(Array.from(new Set(allActiveNodes)));
    setHighlightedEdgeIds(Array.from(new Set(allActiveEdges)));
    setActiveCypher(trace.cypherQuery || trace.reasoningPath[0]?.cypherQuery);
    showToast(`Decision Trace ${trace.traceId} evaluated in ${trace.falkorLatencyMs}ms`);
  };

  const handleSelectReasoningStep = (step: ReasoningStep | null) => {
    if (step) {
      setHighlightedNodeIds(step.activatedNodes);
      setHighlightedEdgeIds(step.activatedEdges);
      if (step.cypherQuery) setActiveCypher(step.cypherQuery);
    }
  };

  const handleEntityAdded = (newNode: GraphNode, newEdge?: GraphEdge) => {
    setNodes((prev) => [...prev, newNode]);
    if (newEdge) {
      setEdges((prev) => [...prev, newEdge]);
      setHighlightedEdgeIds([newEdge.id]);
    }
    setHighlightedNodeIds([newNode.id]);
    showToast(`Fact "${newNode.label}" and relational edge created in FalkorDB!`);
  };

  const handleContradictionResolved = (snapshot: any) => {
    if (snapshot && snapshot.nodes && snapshot.edges) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      // Highlight new superseded edge and new node
      const supEdge = snapshot.edges.find((e: GraphEdge) => e.relationship === "SUPERSEDED_BY");
      if (supEdge) {
        setHighlightedEdgeIds([supEdge.id]);
        setHighlightedNodeIds(["srv_auth_v2", "srv_auth_v3"]);
      }
    }
    showToast("Contradiction resolved: Old edge marked superseded; new lineage established!");
  };

  const handleResetGraph = async () => {
    setIsResetting(true);
    try {
      await fetch("/api/falkordb/reset", { method: "POST" });
      await loadGraph();
      const defaultScenario = DEMO_PRESET_SCENARIOS[0];
      if (defaultScenario) {
        setActiveTrace(defaultScenario.trace);
        const allActiveNodes = defaultScenario.trace.reasoningPath.flatMap((s) => s.activatedNodes);
        const allActiveEdges = defaultScenario.trace.reasoningPath.flatMap((s) => s.activatedEdges);
        setHighlightedNodeIds(Array.from(new Set(allActiveNodes)));
        setHighlightedEdgeIds(Array.from(new Set(allActiveEdges)));
        setActiveCypher(defaultScenario.trace.cypherQuery || defaultScenario.trace.reasoningPath[0]?.cypherQuery);
      }
      showToast("FalkorDB knowledge graph restored to pristine seed state!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const memoryNodeCount = nodes.filter((n) => n.type === "SessionMemory").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header Navigation */}
      <Navigation
        onResetGraph={handleResetGraph}
        isResetting={isResetting}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        onOpenDemoVideoModal={() => setIsDemoVideoModalOpen(true)}
        connectionLatencyMs={activeTrace ? activeTrace.falkorLatencyMs : 0.8}
      />

      {/* Hero Section */}
      <section className="relative">
        <InteractiveVideoHero
          onInitializeSession={() => {
            const target = document.getElementById("interactive-workbench");
            target?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </section>

      {/* Main Interactive Workbench */}
      <main id="interactive-workbench" className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Live Metrics Overview Bar */}
        <StatsOverview
          totalNodes={nodes.length}
          totalEdges={edges.length}
          totalMemories={memoryNodeCount}
          avgConfidence={activeTrace ? `${(activeTrace.confidenceScore * 100).toFixed(1)}%` : "99.4%"}
          avgLatency={activeTrace ? `${activeTrace.falkorLatencyMs}ms` : "0.9ms"}
        />

        {/* Section 1: "Practical Applications & 1-Click Live Benchmarks" */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                  Practical Applications & 1-Click Benchmark Scenarios
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard text/vector RAG fails over multi-hop relational tasks. Select any real-world domain to observe FalkorDB reasoning:
              </p>
            </div>
            <button
              onClick={() => setIsArchitectureModalOpen(true)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Platform Blueprint &amp; Specs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {DEMO_PRESET_SCENARIOS.map((sc, idx) => {
              const useCaseMeta = [
                {
                  domain: "DevOps & SRE",
                  application: "Incident Blast-Radius Analysis",
                  icon: <Activity className="w-3.5 h-3.5 text-cyan-400" />,
                  desc: "Traverses APIGateway → AuthService → UsersDB to isolate root causes and alert service owners.",
                },
                {
                  domain: "Enterprise Org",
                  application: "Company Brain Copilot",
                  icon: <Users className="w-3.5 h-3.5 text-purple-400" />,
                  desc: "Maps ownership lineage across microservices to prevent breaking changes and accelerate onboarding.",
                },
                {
                  domain: "Compliance & Sec",
                  application: "Investigative Fraud & Cycle Audit",
                  icon: <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />,
                  desc: "Detects closed directed transaction loops and deadlock rings via Tarjan's cycle detection algorithm.",
                },
                {
                  domain: "Architecture R&D",
                  application: "Multi-Session Task Management",
                  icon: <Brain className="w-3.5 h-3.5 text-emerald-400" />,
                  desc: "Evolves architectural memory non-destructively: marks old edges superseded and links new replacements.",
                },
              ][idx] || {
                domain: "Cognitive Domain",
                application: sc.title,
                icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
                desc: sc.query,
              };

              return (
                <button
                  key={sc.id}
                  onClick={() => handleTraceGenerated(sc.trace)}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:border-cyan-500/50 hover:bg-slate-900/90 text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {useCaseMeta.icon}
                        <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">
                          {useCaseMeta.domain}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          idx === 0
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                            : idx === 1
                            ? "bg-purple-950 text-purple-300 border border-purple-500/30"
                            : idx === 2
                            ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                        }`}
                      >
                        {sc.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                        {useCaseMeta.application}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                        {useCaseMeta.desc}
                      </p>
                    </div>

                    <div className="p-2 rounded bg-slate-900/90 border border-slate-800/80 text-[10px] font-mono text-slate-300 line-clamp-1">
                      &quot;{sc.query}&quot;
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono font-semibold text-cyan-400">
                    <span>Live GraphBLAS Traversal</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Split Workspace: Interactive Graph Canvas (Left) + Agent Console (Right) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Interactive Graph & Agent Split Workspace
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Dual-Panel Unified Canvas Layout
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Panel (approx 58%): Interactive Graph Canvas */}
            <div className="lg:col-span-7 flex flex-col">
              <GraphVisualizer
                nodes={nodes}
                edges={edges}
                highlightedNodeIds={highlightedNodeIds}
                highlightedEdgeIds={highlightedEdgeIds}
                activeCypher={activeCypher}
                algorithmName={activeTrace ? activeTrace.graphAlgorithm : "FalkorDB GraphBLAS Engine"}
                isTraversing={Boolean(activeTrace)}
                onOpenIngestModal={() => setIsIngestModalOpen(true)}
                onOpenContradictionModal={() => setIsContradictionModalOpen(true)}
                onSelectNode={(node) => {
                  if (node) showToast(`Inspecting: ${node.label} (${node.type})`);
                }}
                onSelectEdge={(edge) => {
                  if (edge) showToast(`Inspecting Edge: [:${edge.relationship}]`);
                }}
              />
            </div>

            {/* Right Panel (approx 42%): Agent Reasoning & Chat Console */}
            <div className="lg:col-span-5 flex flex-col">
              <AgentChatConsole
                onTraceGenerated={handleTraceGenerated}
                activeTrace={activeTrace}
                onSelectReasoningStep={handleSelectReasoningStep}
                currentSessionId={currentSessionId}
                onSessionChange={setCurrentSessionId}
                currentUserProfile={currentUserProfile}
                onProfileChange={setCurrentUserProfile}
              />
            </div>
          </div>
        </section>

        {/* Section 3: The 3 Problem Statement Pillars Interactive Selector */}
        <section className="space-y-4 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              The 3 Problem Statement Pillars: Detailed Audit
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Interactive Deep Dives
            </span>
          </div>

          <PillarTabs activePillar={activePillar} onChange={setActivePillar} />

          {/* Conditional Rendering based on active pillar */}
          {activePillar === "memory" && (
            <PersistentMemoryPanel
              nodes={nodes}
              edges={edges}
              onMemoryAdded={(newNode, newEdges) => {
                setNodes((prev) => [...prev, newNode]);
                setEdges((prev) => [...prev, ...newEdges]);
                showToast(`Persistent memory saved in FalkorDB!`);
              }}
            />
          )}

          {activePillar === "traceability" && (
            <TraceabilityInspector
              trace={activeTrace}
              onSelectStep={handleSelectReasoningStep}
              onHighlightEntities={(nIds, eIds) => {
                setHighlightedNodeIds(nIds);
                setHighlightedEdgeIds(eIds);
              }}
            />
          )}

          {activePillar === "connect" && (
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  Pillar A: Relational Reasoning & Multi-Hop Traversal Pipeline
                </h3>
                <span className="font-mono text-cyan-400 text-[11px]">Sub-Millisecond GraphBLAS</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-300">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-cyan-300">Visual Traversal Animation</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    The graph visualizer animates the exact evaluated path (Node A → Edge → Node B → Edge → Node C)
                    with traveling particles and glowing dashes.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-cyan-300">Graph Algorithm Indicator</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Badges show when FalkorDB executes Shortest Path, BFS Blast Radius, or Tarjan Cycle Detection
                    rather than standard vector similarity.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-cyan-300">Dynamic Ingestion</h4>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    Use the Ingest Fact button above to insert custom nodes and observe instant edge formation in
                    real time on the canvas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 border border-cyan-500 text-cyan-300 text-xs font-medium shadow-2xl shadow-cyan-500/25 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />
      <DemoVideoModal
        isOpen={isDemoVideoModalOpen}
        onClose={() => setIsDemoVideoModalOpen(false)}
      />
      <DynamicIngestionModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        existingNodes={nodes}
        onEntityAdded={handleEntityAdded}
      />
      <ContradictionModal
        isOpen={isContradictionModalOpen}
        onClose={() => setIsContradictionModalOpen(false)}
        onContradictionResolved={handleContradictionResolved}
      />

      {/* Submission Compliance Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-8 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">FalkorDB Cognitive Agent</span>
            <span>•</span>
            <span>Hackathon Submission Release</span>
            <span>•</span>
            <span className="text-cyan-400 font-mono">FalkorDB v0.4 (Active)</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400 font-mono text-[11px]">
            <a
              href="https://github.com/FalkorDB/FalkorDB"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
            </a>
            <button
              onClick={() => setIsDemoVideoModalOpen(true)}
              className="hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Demo Video (3m)</span>
            </button>
            <button
              onClick={() => setIsArchitectureModalOpen(true)}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Architecture & Schema
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
