import { NextResponse } from "next/server";
import { falkorStore } from "@/lib/falkordb-client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const label = searchParams.get("label") || "All";
    const filterMode = searchParams.get("filter") as "all" | "semantic" | "episodic" | null;

    const snapshot = falkorStore.getSnapshot(filterMode || undefined);
    let nodes = snapshot.nodes;
    let edges = snapshot.edges;

    if (label && label !== "All") {
      nodes = nodes.filter((n) => n.type === label);
      const nodeIds = new Set(nodes.map((n) => n.id));
      edges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    }

    if (limit && limit > 0) {
      nodes = nodes.slice(0, limit);
      const nodeIds = new Set(nodes.map((n) => n.id));
      edges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    }

    return NextResponse.json({
      success: true,
      nodes,
      edges,
      total_nodes: snapshot.nodes.length,
      total_edges: snapshot.edges.length,
      filtered_nodes: nodes.length,
      filtered_edges: edges.length,
    });
  } catch (error: any) {
    console.error("Graph state error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
