import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { unlink } from "fs/promises";
import path from "path";
import dbConnect from "@/lib/db/connection";
import { Media } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "media");
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await dbConnect();
    const media = await Media.findByIdAndDelete(id);
    if (!media) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
      const filepath = path.join(process.cwd(), "public", media.url);
      await unlink(filepath);
    } catch {
      // File may already be deleted
    }

    await createAuditLog({
      userId: auth.payload.userId,
      action: "DELETE",
      resource: "media",
      resourceId: id,
      details: { filename: media.filename },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin media delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
