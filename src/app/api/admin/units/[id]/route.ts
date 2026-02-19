import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import { Unit } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { unitUpdateSchema } from "@/validations/unit";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "units");
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await dbConnect();
    const unit = await Unit.findById(id).lean();
    if (!unit) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(unit);
  } catch (err) {
    console.error("Admin unit get error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "units");
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = unitUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    await dbConnect();
    const unit = await Unit.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!unit) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await createAuditLog({
      userId: auth.payload.userId,
      action: "UPDATE",
      resource: "units",
      resourceId: id,
      details: parsed.data,
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(unit);
  } catch (err) {
    console.error("Admin unit update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "units");
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await dbConnect();
    const unit = await Unit.findByIdAndDelete(id);
    if (!unit) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await createAuditLog({
      userId: auth.payload.userId,
      action: "DELETE",
      resource: "units",
      resourceId: id,
      details: { unitNumber: unit.unitNumber },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin unit delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
