import { NextResponse } from "next/server";
import { falkorStore } from "@/lib/falkordb-client";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { user_id: string } }
) {
  try {
    const userId = params.user_id || "user_judge";
    const data = falkorStore.getSessionsForUser(userId);
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error("Sessions endpoint error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
