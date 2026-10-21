import { NextResponse } from "next/server";
import { falkorStore } from "@/lib/falkordb-client";

export async function POST(request: Request) {
  try {
    let domain = "cloud_infra";
    try {
      const body = await request.json();
      if (body?.domain) domain = body.domain;
    } catch {
      // optional body
    }

    const result = falkorStore.seedDatabase(domain);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Seed database error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
