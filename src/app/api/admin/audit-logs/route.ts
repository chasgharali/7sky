import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { AuditLog } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "audit-logs");
  if (!auth.success) return auth.response;

  try {
    await dbConnect();
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get("limit") || "50"), 100);
    const logs = await AuditLog.find({})
      .populate("userId", "email name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json(logs);
  } catch (err) {
    console.error("Audit logs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
