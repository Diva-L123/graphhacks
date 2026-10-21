"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DEMO_PRESET_SCENARIOS,
  AgentDecisionTrace,
  ReasoningStep,
  ToolInvocation,
  ChatApiResponse,
} from "@/lib/mock-graph-data";
import {
  Send,
  Sparkles,
  Terminal,
  Cpu,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  Check,
  Layers,
  User,
  History,
  AlertCircle,
  Database,
  ExternalLink,
} from "lucide-react";

interface AgentChatConsoleProps {
  onTraceGenerated: (trace: AgentDecisionTrace) => void;
  activeTrace: AgentDecisionTrace | null;
  onSelectReasoningStep?: (step: ReasoningStep | null) => void;
  currentSessionId: string;
  onSessionChange: (sessionId: string) => void;
  currentUserProfile: string;
  onProfileChange: (profile: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  sessionId: string;
  userProfile?: string;
  trace?: AgentDecisionTrace;
  pipeline?: ChatApiResponse["pipeline"];
  showTrail?: boolean;
}

export default function AgentChatConsole({
  onTraceGenerated,
  activeTrace,
  onSelectReasoningStep,
  currentSessionId,
  onSessionChange,
  currentUserProfile,
  onProfileChange,
}: AgentChatConsoleProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [copiedQueryId, setCopiedQueryId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize with the first demo benchmark response
  useEffect(() => {
    const defaultScenario = DEMO_PRESET_SCENARIOS[0];
    if (defaultScenario && messages.length === 0) {
      setMessages([
        {
          id: "msg-init-user",
          sender: "user",
          text: defaultScenario.query,
          timestamp: "3 mins ago",
          sessionId: defaultScenario.trace.sessionId,
          userProfile: defaultScenario.trace.userProfile,
        },
        {
          id: "msg-init-agent",
          sender: "agent",
          text: defaultScenario.trace.decisionSummary,
          timestamp: "3 mins ago",
          sessionId: defaultScenario.trace.sessionId,
          userProfile: defaultScenario.trace.userProfile,
          trace: defaultScenario.trace,
          showTrail: true,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  // Execute query against API with streaming simulation
  const runQuery = async (queryText: string, scenarioId?: string) => {
    if ((!queryText.trim() && !scenarioId) || isLoading) return;
    setIsLoading(true);

    const userMsgId = `msg-u-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: queryText,
      timestamp: "Just now",
      sessionId: currentSessionId,
      userProfile: currentUserProfile,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: queryText,
          query: queryText,
          session_id: currentSessionId,
          sessionId: currentSessionId,
          user_id: currentUserProfile.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          userProfile: currentUserProfile,
          scenarioId,
        }),
      });

      const data = await res.json();
      if (data.success && data.trace) {
        const fullTrace: AgentDecisionTrace = data.trace;

        // Streaming text simulation
        setStreamingText("");
        const words = fullTrace.decisionSummary.split(" ");
        let currentString = "";

        for (let i = 0; i < words.length; i++) {
          currentString += (i === 0 ? "" : " ") + words[i];
          setStreamingText(currentString);
          await new Promise((r) => setTimeout(r, 18));
        }

        setStreamingText(null);

        const agentMsg: ChatMessage = {
          id: `msg-a-${Date.now()}`,
          sender: "agent",
          text: fullTrace.decisionSummary,
          timestamp: "Just now",
          sessionId: currentSessionId,
          userProfile: currentUserProfile,
          trace: fullTrace,
          pipeline: data.pipeline,
          showTrail: true, // auto-expand reasoning trail for transparency
        };

        setMessages((prev) => [...prev, agentMsg]);
        onTraceGenerated(fullTrace);
      }
    } catch (err) {
      console.error("Query failed", err);
    } finally {
      setIsLoading(false);
      setStreamingText(null);
    }
  };

  const handleRunPreset = (scenario: (typeof DEMO_PRESET_SCENARIOS)[0]) => {
    setInputQuery(scenario.query);
    runQuery(scenario.query, scenario.id);
  };

  const toggleShowTrail = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, showTrail: !m.showTrail } : m))
    );
  };

  const copyCypher = (cypher: string, id: string) => {
    navigator.clipboard.writeText(cypher);
    setCopiedQueryId(id);
    setTimeout(() => setCopiedQueryId(null), 2000);
  };

  const sessionOptions = [
    { id: "sess_1", label: "Session 1: Architecture Setup" },
    { id: "sess_2", label: "Session 2: Compliance & Incident Review" },
    { id: "sess_3", label: "Session 3: Live Incident & Ingestion" },
    { id: "sess_4", label: "Session 4: Executive Briefing" },
  ];

  const profileOptions = [
    "Lead Core Engineer (Marcus)",
    "Principal Security Architect (Elena)",
    "VP of Engineering (Sarah)",
    "DevOps Incident Commander",
    "Hackathon Judge Evaluation Profile",
  ];

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 backdrop-blur-xl flex flex-col h-full min-h-[640px] shadow-2xl overflow-hidden">
      {/* Console Header with Session & User Profile Switchers */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Agent Reasoning Console</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-semibold">
                FalkorDB Driven
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Queries traverse structured graphs & persistent memory across sessions
            </p>
          </div>
        </div>

        {/* Pillar B: Session & User Profile Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Session Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs font-mono">
            <History className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={currentSessionId}
              onChange={(e) => onSessionChange(e.target.value)}
              className="bg-transparent text-purple-300 font-bold focus:outline-none cursor-pointer text-xs"
            >
              {sessionOptions.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white font-sans">
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* User Profile Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={currentUserProfile}
              onChange={(e) => onProfileChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs max-w-[140px] truncate"
            >
              {profileOptions.map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preset Benchmarks Ribbon (One-Click Scenarios) */}
      <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800/60 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
            1-Click Scenarios:
          </span>
          {DEMO_PRESET_SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleRunPreset(sc)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 text-slate-300 font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{sc.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
          >
            {/* Message metadata tag */}
            <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-slate-500 px-1">
              <span>{msg.sender === "user" ? msg.userProfile || "User" : "FalkorDB Cognitive Agent"}</span>
              <span>•</span>
              <span>{msg.sessionId}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            {/* Bubble */}
            {msg.sender === "user" ? (
              <div className="bg-cyan-600/20 border border-cyan-500/40 text-cyan-100 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] text-xs font-medium shadow-md">
                {msg.text}
              </div>
            ) : (
              <div className="w-full max-w-full space-y-3">
                {/* Agent Card */}
                <div className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl rounded-tl-sm p-4 text-xs space-y-3 shadow-xl transition-all">
                  {/* Top Stats: Grounding Score, Hallucination Check & Latency (Pillar C) */}
                  {msg.trace && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800 text-[11px] font-mono">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Grounding Score */}
                        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-md font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Grounding: {(msg.trace.groundingScore * 100).toFixed(1)}%
                        </span>

                        {/* Hallucination Check */}
                        <span className="flex items-center gap-1 text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          Hallucination Risk: {(msg.trace.hallucinationRisk * 100).toFixed(1)}%
                        </span>

                        {/* Algorithm Badge */}
                        <span className="text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[10px]">
                          {msg.trace.graphAlgorithm}
                        </span>
                      </div>

                      {/* FalkorDB Latency */}
                      <span className="flex items-center gap-1 text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        {msg.trace.falkorLatencyMs}ms
                      </span>
                    </div>
                  )}

                  {/* 4 Core Logic Modules Execution Telemetry */}
                  {msg.pipeline && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
                      <div className="p-2 rounded-lg bg-slate-950 border border-purple-500/30 flex flex-col justify-between">
                        <span className="text-purple-400 font-bold uppercase tracking-wider">M1: Hydration</span>
                        <span className="text-slate-300 mt-0.5 truncate" title={msg.pipeline.module1_hydration.active_facts.join("; ")}>
                          {msg.pipeline.module1_hydration.active_facts.length} Facts Recalled
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-cyan-500/30 flex flex-col justify-between">
                        <span className="text-cyan-400 font-bold uppercase tracking-wider">M2: Intent Tool</span>
                        <span className="text-slate-300 mt-0.5 truncate" title={msg.pipeline.module2_routing.selected_tool}>
                          {msg.pipeline.module2_routing.selected_tool.replace(" Tool", "")}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-emerald-500/30 flex flex-col justify-between">
                        <span className="text-emerald-400 font-bold uppercase tracking-wider">M3: Subgraph</span>
                        <span className="text-slate-300 mt-0.5">
                          {msg.pipeline.module3_subgraph.nodes_count}N / {msg.pipeline.module3_subgraph.edges_count}E ({msg.pipeline.module3_subgraph.execution_ms}ms)
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-amber-500/30 flex flex-col justify-between">
                        <span className="text-amber-400 font-bold uppercase tracking-wider">M4: Evolution</span>
                        <span className="text-slate-300 mt-0.5">
                          {msg.pipeline.module4_evolution.conflicts_detected ? "Edge Superseded" : "Committed"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Main Response Text */}
                  <p className="text-slate-100 text-xs leading-relaxed font-sans font-medium">
                    {msg.text}
                  </p>

                  {/* Recommendations */}
                  {msg.trace?.recommendations && msg.trace.recommendations.length > 0 && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                        Traceable Graph Recommendations:
                      </span>
                      <ul className="space-y-1">
                        {msg.trace.recommendations.map((rec, i) => (
                          <li key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                            <span className="text-cyan-400 font-bold mt-0.5">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tool Invocations Execution Log */}
                  {msg.trace?.toolCalls && msg.trace.toolCalls.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                        Step-by-Step Tool Invocations & Cypher Execution:
                      </span>
                      <div className="space-y-1.5 font-mono text-[11px]">
                        {msg.trace.toolCalls.map((tc, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-slate-950/80 rounded-lg border border-slate-800/80 flex items-start justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <span className="text-cyan-400 font-bold flex items-center gap-1">
                                <Terminal className="w-3 h-3" />
                                {tc.toolName}
                              </span>
                              <span className="text-slate-400 text-[10px] block font-sans">
                                {tc.purpose}
                              </span>
                              <span className="text-emerald-300 text-[10px] block">
                                → {tc.output}
                              </span>
                            </div>
                            <span className="text-slate-500 text-[10px] shrink-0 font-mono">
                              {tc.latencyMs}ms
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pillar C: "Show Reasoning Trail" / "Explain This" Button Toggle */}
                  {msg.trace && (
                    <div className="pt-1">
                      <button
                        onClick={() => toggleShowTrail(msg.id)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-cyan-300 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>
                            {msg.showTrail ? "Hide Reasoning Trail" : "Show Reasoning Trail / Explain This"}
                          </span>
                        </span>
                        {msg.showTrail ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {/* Expandable Reasoning Trail Panel */}
                      <AnimatePresence>
                        {msg.showTrail && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 bg-slate-950/95 border border-cyan-500/30 rounded-xl p-4 space-y-4 overflow-hidden"
                          >
                            {/* Generated Cypher Query */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                                  Exact Generated Cypher Sent to FalkorDB:
                                </span>
                                <button
                                  onClick={() => copyCypher(msg.trace!.cypherQuery, msg.id)}
                                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                                >
                                  {copiedQueryId === msg.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy Query</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                                {msg.trace.cypherQuery}
                              </pre>
                            </div>

                            {/* Raw Execution Metrics */}
                            <div className="grid grid-cols-3 gap-2 text-center font-mono">
                              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                                <span className="text-[9px] text-slate-500 block uppercase">Query Time</span>
                                <span className="text-xs font-bold text-amber-300 mt-0.5 block">
                                  {msg.trace.falkorLatencyMs} ms
                                </span>
                              </div>
                              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                                <span className="text-[9px] text-slate-500 block uppercase">Verified Hops</span>
                                <span className="text-xs font-bold text-purple-300 mt-0.5 block">
                                  {msg.trace.reasoningPath.length} Hops
                                </span>
                              </div>
                              <div className="p-2 bg-slate-900 rounded border border-slate-800">
                                <span className="text-[9px] text-slate-500 block uppercase">Subgraphs Scanned</span>
                                <span className="text-xs font-bold text-cyan-300 mt-0.5 block">
                                  {msg.trace.retrievedSubgraph.nodesCount} Nodes / {msg.trace.retrievedSubgraph.edgesCount} Edges
                                </span>
                              </div>
                            </div>

                            {/* Retrieved Subgraph Entities */}
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                                Retrieved Subgraph Entity Provenance:
                              </span>
                              <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                                {msg.trace.retrievedSubgraph.entities.map((entId) => (
                                  <span
                                    key={entId}
                                    className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                                  >
                                    {entId}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Step Stepper Preview */}
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1.5">
                                Step-by-Step Traversal Chain:
                              </span>
                              <div className="space-y-1.5">
                                {msg.trace.reasoningPath.map((step) => (
                                  <button
                                    key={step.step}
                                    onClick={() => onSelectReasoningStep && onSelectReasoningStep(step)}
                                    className="w-full text-left p-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] transition-colors flex items-center justify-between"
                                  >
                                    <span className="font-semibold text-slate-200">
                                      Hop {step.step}: {step.title}
                                    </span>
                                    <span className="text-[10px] font-mono text-cyan-400">
                                      Highlight in Canvas →
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Live streaming bubble */}
        {streamingText && (
          <div className="flex flex-col items-start w-full">
            <div className="text-[10px] font-mono text-slate-500 mb-1 px-1">
              FalkorDB Cognitive Agent • Streaming...
            </div>
            <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl rounded-tl-sm p-4 text-xs text-slate-100 shadow-xl w-full leading-relaxed font-sans">
              <span>{streamingText}</span>
              <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Field Form */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runQuery(inputQuery);
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask FalkorDB (e.g. 'Who should be alerted if Auth-V2 fails?')"
            className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 pr-28 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all font-sans"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Traversing...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Execute</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
