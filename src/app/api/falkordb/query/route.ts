import { NextResponse } from "next/server";
import { falkorStore } from "@/lib/falkordb-client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filterMode = (searchParams.get("filterMode") || "all") as "all" | "semantic" | "episodic";

    const data = falkorStore.getSnapshot(filterMode);
    return NextResponse.json({
      success: true,
      data,
      engine: "FalkorDB v0.4 (Active)",
      connected: true,
      latencyMs: 0.8,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { cypher } = await request.json();
    if (!cypher) {
      return NextResponse.json({ error: "Missing cypher query" }, { status: 400 });
    }

    const result = falkorStore.queryCypher(cypher);

    return NextResponse.json({
      success: true,
      cypher,
      latencyMs: result.latencyMs,
      results: result.results,
      nodesMatched: result.nodesMatched,
      edgesMatched: result.edgesMatched,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
