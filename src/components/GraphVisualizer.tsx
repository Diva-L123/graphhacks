"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraphNode, GraphEdge, NodeType } from "@/lib/mock-graph-data";
import {
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Database,
  Sparkles,
  X,
  Plus,
  GitCompare,
  ArrowRight,
  ExternalLink,
  Info,
  ShieldCheck,
  Cpu,
  Clock,
  Eye,
  Activity,
} from "lucide-react";

interface GraphVisualizerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightedNodeIds?: string[];
  highlightedEdgeIds?: string[];
  onSelectNode?: (node: GraphNode | null) => void;
  onSelectEdge?: (edge: GraphEdge | null) => void;
  activeCypher?: string;
  isTraversing?: boolean;
  algorithmName?: string;
  onOpenIngestModal?: () => void;
  onOpenContradictionModal?: () => void;
}

const TYPE_COLORS: Record<string, { bg: string; border: string; glow: string; text: string; badge: string }> = {
  Service: {
    bg: "rgba(6, 182, 212, 0.15)",
    border: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.6)",
    text: "#67e8f9",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  Team: {
    bg: "rgba(59, 130, 246, 0.18)",
    border: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.6)",
    text: "#93c5fd",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  Person: {
    bg: "rgba(16, 185, 129, 0.15)",
    border: "#10b981",
    glow: "rgba(16, 185, 129, 0.6)",
    text: "#6ee7b7",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  SessionMemory: {
    bg: "rgba(168, 85, 247, 0.2)",
    border: "#a855f7",
    glow: "rgba(168, 85, 247, 0.7)",
    text: "#d8b4fe",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  Incident: {
    bg: "rgba(239, 68, 68, 0.2)",
    border: "#ef4444",
    glow: "rgba(239, 68, 68, 0.7)",
    text: "#fca5a5",
    badge: "bg-red-500/20 text-red-300 border-red-500/30",
  },
  Policy: {
    bg: "rgba(245, 158, 11, 0.15)",
    border: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.6)",
    text: "#fcd34d",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  Decision: {
    bg: "rgba(20, 184, 166, 0.25)",
    border: "#14b8a6",
    glow: "rgba(20, 184, 166, 0.8)",
    text: "#5eead4",
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  },
  Vulnerability: {
    bg: "rgba(236, 72, 153, 0.2)",
    border: "#ec4899",
    glow: "rgba(236, 72, 153, 0.7)",
    text: "#f472b6",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  Session: {
    bg: "rgba(99, 102, 241, 0.2)",
    border: "#6366f1",
    glow: "rgba(99, 102, 241, 0.7)",
    text: "#a5b4fc",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
};

export default function GraphVisualizer({
  nodes,
  edges,
  highlightedNodeIds = [],
  highlightedEdgeIds = [],
  onSelectNode,
  onSelectEdge,
  activeCypher,
  isTraversing = false,
  algorithmName = "FalkorDB GraphBLAS Engine",
  onOpenIngestModal,
  onOpenContradictionModal,
}: GraphVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNodeType, setFilterNodeType] = useState<string>("All");
  const [filterRelationType, setFilterRelationType] = useState<string>("All");
  const [memoryViewMode, setMemoryViewMode] = useState<"all" | "semantic" | "episodic">("all");

  // Zoom & Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);

  // Calculate layout
  const resetLayout = () => {
    const width = 940;
    const height = 620;
    const centerX = width / 2;
    const centerY = height / 2;
    const newPos = new Map<string, { x: number; y: number }>();

    const clusters: Record<string, { angle: number; radius: number }> = {
      Service: { angle: -Math.PI / 2, radius: 170 },
      Team: { angle: -Math.PI * 0.75, radius: 240 },
      Person: { angle: -Math.PI * 0.95, radius: 250 },
      SessionMemory: { angle: Math.PI * 0.15, radius: 230 },
      Policy: { angle: Math.PI * 0.8, radius: 230 },
      Incident: { angle: -Math.PI * 0.1, radius: 200 },
      Vulnerability: { angle: -Math.PI * 0.35, radius: 250 },
      Decision: { angle: Math.PI * 0.5, radius: 190 },
      Session: { angle: Math.PI * 0.3, radius: 270 },
    };

    const typeCount: Record<string, number> = {};

    nodes.forEach((node) => {
      const type = node.type;
      const count = typeCount[type] || 0;
      typeCount[type] = count + 1;

      const cluster = clusters[type] || { angle: 0, radius: 200 };
      const spreadAngle = cluster.angle + (count - 1) * 0.36;
      const jitterX = Math.cos(spreadAngle) * (cluster.radius + (count % 2 === 0 ? 30 : -25));
      const jitterY = Math.sin(spreadAngle) * (cluster.radius + (count % 2 === 0 ? -25 : 35));

      newPos.set(node.id, {
        x: Math.round(centerX + jitterX),
        y: Math.round(centerY + jitterY),
      });
    });

    setNodePositions(newPos);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    resetLayout();
  }, [nodes.length]);

  // Handle Pan & Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - pan.x) / zoom;
      const currentY = (e.clientY - rect.top - pan.y) / zoom;
      setNodePositions((prev) => {
        const next = new Map(prev);
        next.set(draggedNodeId, { x: currentX, y: currentY });
        return next;
      });
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
  };

  // Node & Edge Filtering logic
  const filteredNodes = nodes.filter((node) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesLabel = node.label.toLowerCase().includes(q);
      const matchesType = node.type.toLowerCase().includes(q);
      const matchesProps = Object.values(node.properties).some(
        (val) => typeof val === "string" && val.toLowerCase().includes(q)
      );
      if (!matchesLabel && !matchesType && !matchesProps) return false;
    }

    // 2. Memory View Mode (Episodic vs Semantic vs All)
    if (memoryViewMode === "semantic") {
      if (node.isEpisodic || node.type === "Session") return false;
    }
    if (memoryViewMode === "episodic") {
      if (!node.isEpisodic && node.type !== "Session" && node.type !== "SessionMemory") return false;
    }

    // 3. Node Type Filter
    if (filterNodeType !== "All" && node.type !== filterNodeType) {
      return false;
    }

    return true;
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredEdges = edges.filter((edge) => {
    // Both endpoints must exist in visible nodes
    if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) {
      return false;
    }

    // Relation type filter
    if (filterRelationType !== "All" && edge.relationship !== filterRelationType) {
      return false;
    }

    // Memory view filter
    if (memoryViewMode === "semantic" && edge.isEpisodic) return false;
    if (memoryViewMode === "episodic" && !edge.isEpisodic && !edge.sessionOrigin) return false;

    return true;
  });

  // Unique types and relationships for filter dropdowns
  const availableNodeTypes = ["All", ...Array.from(new Set(nodes.map((n) => n.type)))];
  const availableRelationTypes = ["All", ...Array.from(new Set(edges.map((e) => e.relationship)))];

  // Node Click
  const handleNodeClick = (node: GraphNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(node);
    setSelectedEdge(null);
    if (onSelectNode) onSelectNode(node);
  };

  // Edge Click
  const handleEdgeClick = (edge: GraphEdge, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEdge(edge);
    setSelectedNode(null);
    if (onSelectEdge) onSelectEdge(edge);
  };

  // Auto-focus node from search
  const handleSearchNode = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const match = nodes.find((n) => n.label.toLowerCase().includes(query.toLowerCase()));
      if (match) {
        const pos = nodePositions.get(match.id);
        if (pos) {
          setPan({ x: 470 - pos.x * zoom, y: 310 - pos.y * zoom });
        }
      }
    }
  };

  return (
    <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-950/85 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col h-full min-h-[640px]">
      {/* Visualizer Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/70 gap-3">
        {/* Title, Badge & Algorithm Execution Indicator */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">Interactive Graph Canvas</h3>
          </div>

          {/* Graph Algorithm Indicator Badge (Pillar A) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono shadow-sm">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="font-semibold">{algorithmName}</span>
          </div>

          {/* Node/Edge stats counter */}
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700/80">
            {filteredNodes.length} Nodes • {filteredEdges.length} Edges
          </span>

          {/* Visual Traversal Active Flag */}
          {(isTraversing || highlightedEdgeIds.length > 0) && (
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full animate-pulse font-mono font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Path Traversal Active ({highlightedNodeIds.length} Nodes / {highlightedEdgeIds.length} Edges)
            </span>
          )}
        </div>

        {/* Quick Action Buttons (Dynamic Ingestion & Contradiction) */}
        <div className="flex items-center gap-2">
          {onOpenIngestModal && (
            <button
              onClick={onOpenIngestModal}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-cyan-500/10"
              title="Add custom node/fact & immediate edge"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ingest Fact/Edge</span>
            </button>
          )}

          {onOpenContradictionModal && (
            <button
              onClick={onOpenContradictionModal}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-purple-500/10"
              title="Test contradiction handling and edge supersession"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Test Contradiction</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Sub-Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-2.5 border-b border-slate-800/60 bg-slate-950/60 gap-3 text-xs">
        {/* Search Input */}
        <div className="relative min-w-[200px] max-w-xs flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchNode(e.target.value)}
            placeholder="Search nodes by label or property..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Episodic vs Semantic View Toggle (Pillar B) */}
          <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setMemoryViewMode("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                memoryViewMode === "all" ? "bg-cyan-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Unified Graph
            </button>
            <button
              onClick={() => setMemoryViewMode("semantic")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                memoryViewMode === "semantic"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Semantic Facts
            </button>
            <button
              onClick={() => setMemoryViewMode("episodic")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                memoryViewMode === "episodic"
                  ? "bg-purple-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Episodic Sessions
            </button>
          </div>

          {/* Node Type Filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Node:</span>
            <select
              value={filterNodeType}
              onChange={(e) => setFilterNodeType(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              {availableNodeTypes.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Relationship Filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-mono">Edge:</span>
            <select
              value={filterRelationType}
              onChange={(e) => setFilterRelationType(e.target.value)}
              className="bg-transparent text-cyan-300 text-xs font-mono focus:outline-none cursor-pointer"
            >
              {availableRelationTypes.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-cyan-300 font-mono">
                  {r === "All" ? "All Relations" : `[:${r}]`}
                </option>
              ))}
            </select>
          </div>

          {/* Zoom & Reset Buttons */}
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.15, 2.4))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetLayout}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
              title="Reset Layout"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => {
          setSelectedNode(null);
          setSelectedEdge(null);
        }}
        className="relative flex-1 w-full h-[520px] bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] cursor-grab active:cursor-grabbing select-none overflow-hidden"
      >
        <svg
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isPanning || draggedNodeId ? "none" : "transform 0.12s ease-out",
          }}
        >
          <defs>
            {/* Arrowheads */}
            <marker id="arrowhead-default" markerWidth="9" markerHeight="7" refX="20" refY="3.5" orient="auto">
              <polygon points="0 0, 9 3.5, 0 7" fill="#475569" />
            </marker>
            <marker id="arrowhead-highlight" markerWidth="11" markerHeight="8" refX="24" refY="4" orient="auto">
              <polygon points="0 0, 11 4, 0 8" fill="#22d3ee" />
            </marker>
            <marker id="arrowhead-superseded" markerWidth="9" markerHeight="7" refX="20" refY="3.5" orient="auto">
              <polygon points="0 0, 9 3.5, 0 7" fill="#f87171" />
            </marker>

            {/* Glowing filter for traversal animation */}
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Graph Edges */}
          {filteredEdges.map((edge) => {
            const sourcePos = nodePositions.get(edge.source);
            const targetPos = nodePositions.get(edge.target);
            if (!sourcePos || !targetPos) return null;

            const isHighlighted =
              highlightedEdgeIds.includes(edge.id) ||
              (hoveredNodeId && (edge.source === hoveredNodeId || edge.target === hoveredNodeId)) ||
              (selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id));

            const isSelected = selectedEdge?.id === edge.id;
            const isHovered = hoveredEdgeId === edge.id;
            const isSuperseded = edge.status === "superseded" || edge.status === "deprecated";

            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;

            return (
              <g
                key={edge.id}
                onClick={(e) => handleEdgeClick(edge, e)}
                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
                className="cursor-pointer group"
              >
                {/* Fat invisible line for easier click detection */}
                <line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke="transparent"
                  strokeWidth="18"
                />

                {/* Visible Edge Line */}
                <line
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke={
                    isSuperseded
                      ? "#f87171"
                      : isHighlighted || isSelected || isHovered
                      ? "#22d3ee"
                      : edge.isEpisodic
                      ? "#818cf8"
                      : "#334155"
                  }
                  strokeWidth={isHighlighted || isSelected ? 3.5 : isHovered ? 2.5 : isSuperseded ? 2 : 1.5}
                  strokeDasharray={isSuperseded ? "5 4" : isHighlighted ? "6 3" : undefined}
                  className={isHighlighted ? "animate-pulse" : ""}
                  markerEnd={
                    isSuperseded
                      ? "url(#arrowhead-superseded)"
                      : isHighlighted || isSelected || isHovered
                      ? "url(#arrowhead-highlight)"
                      : "url(#arrowhead-default)"
                  }
                />

                {/* Animated Traversal Particle when highlighted (Pillar A Visual Traversal) */}
                {isHighlighted && (
                  <circle
                    r="4"
                    fill="#38bdf8"
                    filter="url(#glow-filter)"
                  >
                    <animateMotion
                      path={`M ${sourcePos.x} ${sourcePos.y} L ${targetPos.x} ${targetPos.y}`}
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Edge relationship badge */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x={isSuperseded ? "-60" : "-48"}
                    y="-9"
                    width={isSuperseded ? "120" : "96"}
                    height="18"
                    rx="4"
                    fill={
                      isSuperseded
                        ? "#450a0a"
                        : isHighlighted || isSelected
                        ? "#083344"
                        : edge.isEpisodic
                        ? "#1e1b4b"
                        : "#0f172a"
                    }
                    stroke={
                      isSuperseded
                        ? "#ef4444"
                        : isHighlighted || isSelected
                        ? "#06b6d4"
                        : edge.isEpisodic
                        ? "#6366f1"
                        : "#334155"
                    }
                    strokeWidth="1"
                    className="transition-colors"
                  />
                  <text
                    textAnchor="middle"
                    y="3"
                    fill={
                      isSuperseded
                        ? "#fca5a5"
                        : isHighlighted || isSelected
                        ? "#67e8f9"
                        : edge.isEpisodic
                        ? "#c7d2fe"
                        : "#94a3b8"
                    }
                    fontSize="9"
                    fontWeight={isHighlighted || isSelected ? "bold" : "normal"}
                    fontFamily="monospace"
                  >
                    {isSuperseded ? `${edge.relationship} (SUPERSEDED)` : edge.relationship}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render Graph Nodes */}
          {filteredNodes.map((node) => {
            const pos = nodePositions.get(node.id) || { x: 300, y: 300 };
            const style = TYPE_COLORS[node.type] || TYPE_COLORS.Service;
            const isHighlighted = highlightedNodeIds.includes(node.id) || hoveredNodeId === node.id;
            const isSelected = selectedNode?.id === node.id;
            const isDeprecated = node.properties?.status?.toString().toLowerCase().includes("deprecated");

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={(e) => handleNodeClick(node, e)}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedNodeId(node.id);
                }}
                className="cursor-pointer group"
              >
                {/* Glow ring when selected or active in reasoning path */}
                {(isHighlighted || isSelected) && (
                  <circle
                    r="34"
                    fill="none"
                    stroke={style.border}
                    strokeWidth="3"
                    className="animate-ping opacity-45"
                  />
                )}

                {/* Node Main Circle */}
                <circle
                  r="24"
                  fill={isSelected ? style.border : style.bg}
                  stroke={isDeprecated ? "#ef4444" : style.border}
                  strokeWidth={isHighlighted || isSelected ? 3.5 : 2}
                  strokeDasharray={isDeprecated ? "4 3" : undefined}
                  filter={isHighlighted ? `drop-shadow(0 0 14px ${style.glow})` : undefined}
                  className="transition-transform duration-200 group-hover:scale-110"
                />

                {/* Node Initials inside circle */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill={isSelected ? "#020617" : style.text}
                  fontSize="11"
                  fontWeight="bold"
                  pointerEvents="none"
                  fontFamily="system-ui"
                >
                  {node.type.slice(0, 2).toUpperCase()}
                </text>

                {/* Label Box below node */}
                <g transform="translate(0, 36)" pointerEvents="none">
                  <rect
                    x="-62"
                    y="-8"
                    width="124"
                    height="18"
                    rx="4"
                    fill="rgba(15, 23, 42, 0.95)"
                    stroke={isHighlighted ? style.border : "rgba(51, 65, 85, 0.7)"}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    y="5"
                    fill={isHighlighted ? "#f8fafc" : "#cbd5e1"}
                    fontSize="10"
                    fontWeight={isHighlighted ? "bold" : "500"}
                  >
                    {node.label.length > 17 ? node.label.slice(0, 15) + "..." : node.label}
                  </text>
                </g>

                {/* Session Origin Tag (Crucial for Persistent Memory showcase) */}
                {node.sessionOrigin && (
                  <g transform="translate(0, -32)" pointerEvents="none">
                    <rect
                      x="-50"
                      y="-7"
                      width="100"
                      height="14"
                      rx="3"
                      fill="#1e1b4b"
                      stroke="#818cf8"
                      strokeWidth="0.8"
                    />
                    <text textAnchor="middle" y="4" fill="#c7d2fe" fontSize="8" fontWeight="bold">
                      {node.sessionOrigin.slice(0, 18)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Inspector Sidebar / Details Drawer (Click on any Node OR Edge) */}
        <AnimatePresence>
          {(selectedNode || selectedEdge) && (
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className="absolute top-4 right-4 bottom-4 w-84 max-w-[340px] bg-slate-900/95 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl backdrop-blur-xl z-20 flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Node Inspector */}
              {selectedNode && (
                <div className="flex flex-col h-full overflow-y-auto space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono border font-bold uppercase ${
                          TYPE_COLORS[selectedNode.type]?.badge || "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {selectedNode.type}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5 leading-snug">
                        {selectedNode.label}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">ID: {selectedNode.id}</span>
                    </div>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedNode.sessionOrigin && (
                    <div className="bg-purple-950/40 border border-purple-500/30 rounded-lg p-2.5 text-xs">
                      <span className="text-purple-300 font-semibold block text-[11px]">
                        Persistent Memory Session Origin:
                      </span>
                      <span className="text-purple-200">{selectedNode.sessionOrigin}</span>
                    </div>
                  )}

                  {/* Properties Table */}
                  <div className="space-y-1.5">
                    <span className="text-slate-400 font-mono text-xs block font-semibold">
                      Node Properties:
                    </span>
                    <div className="space-y-1">
                      {Object.entries(selectedNode.properties).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between bg-slate-950/70 p-1.5 rounded border border-slate-800 font-mono text-[11px]"
                        >
                          <span className="text-slate-400">{k}:</span>
                          <span className="text-cyan-300 max-w-[160px] truncate text-right font-medium">
                            {String(v)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Connected Relationships */}
                  <div className="pt-1">
                    <span className="text-slate-400 font-mono text-xs block mb-1 font-semibold">
                      Connected Relationships:
                    </span>
                    <div className="max-h-36 overflow-y-auto space-y-1">
                      {edges
                        .filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)
                        .map((e) => {
                          const isOut = e.source === selectedNode.id;
                          const otherId = isOut ? e.target : e.source;
                          const otherNode = nodes.find((n) => n.id === otherId);
                          return (
                            <div
                              key={e.id}
                              onClick={() => {
                                if (otherNode) setSelectedNode(otherNode);
                              }}
                              className="text-[11px] bg-slate-950 hover:bg-slate-800 p-2 rounded border border-slate-800 flex items-center justify-between text-slate-300 cursor-pointer transition-colors"
                            >
                              <span className="text-cyan-400 font-mono font-bold">[:{e.relationship}]</span>
                              <span className="text-slate-400 truncate max-w-[120px]">
                                {isOut ? `→ ${otherNode?.label}` : `← ${otherNode?.label}`}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Quick Cypher Generator */}
                  <div className="mt-auto pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      openCypher Query:
                    </span>
                    <code className="text-[10px] font-mono text-emerald-300 bg-slate-950 p-2 rounded block whitespace-pre-wrap border border-slate-800">
                      {`MATCH (n:${selectedNode.type} {id: '${selectedNode.id}'})-[r]-(target) RETURN n, r, target;`}
                    </code>
                  </div>
                </div>
              )}

              {/* Edge Inspector */}
              {selectedEdge && (
                <div className="flex flex-col h-full overflow-y-auto space-y-4">
                  <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono border font-bold uppercase bg-cyan-950 text-cyan-300 border-cyan-500/40">
                        Relationship Edge
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5 font-mono">
                        [:{selectedEdge.relationship}]
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">ID: {selectedEdge.id}</span>
                    </div>
                    <button
                      onClick={() => setSelectedEdge(null)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800 text-xs">
                    <span className="text-slate-400">Edge Status:</span>
                    <span
                      className={`font-mono font-bold uppercase ${
                        selectedEdge.status === "superseded"
                          ? "text-red-400"
                          : selectedEdge.status === "deprecated"
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {selectedEdge.status || "active"}
                    </span>
                  </div>

                  {/* Source & Target Nodes */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">SOURCE NODE:</span>
                      <span className="font-semibold text-cyan-300">
                        {nodes.find((n) => n.id === selectedEdge.source)?.label || selectedEdge.source}
                      </span>
                    </div>

                    <div className="text-center text-slate-500 text-xs font-mono">↓ {selectedEdge.relationship} ↓</div>

                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                      <span className="text-[10px] text-slate-500 font-mono block">TARGET NODE:</span>
                      <span className="font-semibold text-emerald-300">
                        {nodes.find((n) => n.id === selectedEdge.target)?.label || selectedEdge.target}
                      </span>
                    </div>
                  </div>

                  {/* Properties */}
                  {selectedEdge.properties && Object.keys(selectedEdge.properties).length > 0 && (
                    <div className="space-y-1">
                      <span className="text-slate-400 font-mono text-xs block font-semibold">
                        Edge Properties:
                      </span>
                      {Object.entries(selectedEdge.properties).map(([k, v]) => (
                        <div
                          key={k}
                          className="flex items-center justify-between bg-slate-950/70 p-1.5 rounded border border-slate-800 font-mono text-[11px]"
                        >
                          <span className="text-slate-400">{k}:</span>
                          <span className="text-cyan-300 truncate">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cypher */}
                  <div className="mt-auto pt-3 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                      openCypher Query:
                    </span>
                    <code className="text-[10px] font-mono text-emerald-300 bg-slate-950 p-2 rounded block whitespace-pre-wrap border border-slate-800">
                      {`MATCH (s {id: '${selectedEdge.source}'})-[r:${selectedEdge.relationship}]->(t {id: '${selectedEdge.target}'}) RETURN s, r, t;`}
                    </code>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Canvas Controls Helper */}
        <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 pointer-events-none flex items-center gap-2 shadow-lg">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click node/edge to inspect • Drag node to move • Mouse drag to pan • Scroll to zoom</span>
        </div>
      </div>

      {/* Real-time Cypher Query Footprint Footer */}
      {activeCypher && (
        <div className="px-5 py-2.5 border-t border-slate-800 bg-slate-950/95 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-500/40">
              ACTIVE CYPHER
            </span>
            <code className="text-xs font-mono text-emerald-300 whitespace-nowrap">
              {activeCypher}
            </code>
          </div>
          <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2 hidden sm:inline">
            FalkorDB Sub-Millisecond In-Memory Traversal
          </span>
        </div>
      )}
    </div>
  );
}
