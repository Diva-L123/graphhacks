import { NextResponse } from "next/server";
import { falkorStore } from "@/lib/falkordb-client";
import { NodeType } from "@/lib/mock-graph-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action = "addMemory" } = body;

    // 1. Contradiction resolution
    if (action === "contradict") {
      const {
        oldEntityId = "srv_auth_v2",
        newEntityId = "srv_auth_v3",
        subjectId = "team_alpha",
        relationship = "OWNS",
      } = body;

      const result = falkorStore.handleContradiction(oldEntityId, newEntityId, subjectId, relationship);
      const snapshot = falkorStore.getSnapshot();

      return NextResponse.json({
        success: true,
        action: "contradict",
        result,
        snapshot,
        message: `Contradiction resolved: ${oldEntityId} superseded by ${newEntityId}. Edge marked superseded.`,
      });
    }

    // 2. Dynamic Entity / Node / Relationship Ingestion
    if (action === "addEntity") {
      const {
        label,
        type = "Service",
        properties = {},
        targetNodeId,
        relationship = "CONNECTS_TO",
        sessionOrigin = "Session 3 (Live Ingestion)",
      } = body;

      if (!label) {
        return NextResponse.json({ error: "Label is required" }, { status: 400 });
      }

      const { node, edge } = falkorStore.addDynamicEntity(
        label,
        type as NodeType,
        properties,
        targetNodeId,
        relationship,
        sessionOrigin
      );

      const snapshot = falkorStore.getSnapshot();

      return NextResponse.json({
        success: true,
        action: "addEntity",
        node,
        edge,
        snapshot,
        message: `Entity "${label}" (${type}) and edge ingested into FalkorDB in real time.`,
      });
    }

    // 3. Add Memory Node
    const { sessionId, label, details, relatedNodeIds } = body;
    if (!label || !details) {
      return NextResponse.json({ error: "Label and details are required" }, { status: 400 });
    }

    const { memoryNode, newEdges } = falkorStore.addSessionMemory(
      sessionId || `Session 3 (Live)`,
      label,
      details,
      relatedNodeIds || ["srv_auth"]
    );

    const snapshot = falkorStore.getSnapshot();

    return NextResponse.json({
      success: true,
      memoryNode,
      newEdges,
      snapshot,
      message: "Memory node and relational edges persisted to FalkorDB.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
