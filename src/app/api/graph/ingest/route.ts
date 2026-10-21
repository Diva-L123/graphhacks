import { NextResponse } from "next/server";
import { falkorStore } from "@/lib/falkordb-client";

export async function POST(request: Request) {
  try {
    const { text, source = "unstructured_document" } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const result = falkorStore.ingestUnstructuredText(text, source);

    return NextResponse.json({
      success: true,
      status: "Document text parsed and ingested into FalkorDB knowledge graph",
      ...result,
    });
  } catch (error: any) {
    console.error("Ingest endpoint error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
