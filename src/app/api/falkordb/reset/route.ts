import { NextResponse } from "next/server";
import { falkorStore } from "@/lib/falkordb-client";

export async function POST() {
  try {
    falkorStore.reset();
    return NextResponse.json({
      success: true,
      message: "FalkorDB knowledge graph reset to baseline schema.",
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
