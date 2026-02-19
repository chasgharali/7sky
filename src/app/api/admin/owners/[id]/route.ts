import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import { Owner } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { ownerSchema } from "@/validations/owner";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "owners");
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await dbConnect();
    const owner = await Owner.findById(id)
      .populate("unitId", "unitNumber floor type price status")
      .lean();
    if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(owner);
  } catch (err) {
    console.error("Admin owner get error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "owners");
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const { transferNote, ...rest } = body;
    const isTransfer = Boolean(transferNote);

    const parsed = ownerSchema.partial().safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    await dbConnect();
    const updateData: Record<string, unknown> = { ...parsed.data };

    const existing = await Owner.findById(id).lean();
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (updateData.totalAmount !== undefined || updateData.amountPaid !== undefined) {
      const total = (updateData.totalAmount as number) ?? existing.totalAmount;
      const paid = (updateData.amountPaid as number) ?? existing.amountPaid;
      updateData.pendingAmount = total - paid;
    }

    let owner;
    let previousOwnerDetails: Record<string, string> = {};

    if (isTransfer) {
      previousOwnerDetails = {
        previousOwnerName: existing.ownerName,
        previousCnic: existing.cnic,
        previousPhone: existing.phone || "",
      };

      const identityFields: Record<string, unknown> = {};
      if (updateData.ownerName !== undefined) identityFields.ownerName = updateData.ownerName;
      if (updateData.cnic !== undefined) identityFields.cnic = updateData.cnic;
      if (updateData.phone !== undefined) identityFields.phone = updateData.phone;

      owner = await Owner.findByIdAndUpdate(
        id,
        {
          $set: identityFields,
          $push: {
            transferHistory: {
              previousOwnerName: existing.ownerName,
              previousCnic: existing.cnic,
              previousPhone: existing.phone || "",
              transferNote: transferNote || "",
              transferredAt: new Date(),
            },
          },
        },
        { new: true }
      );
    } else {
      owner = await Owner.findByIdAndUpdate(id, updateData, { new: true });
    }

    if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await createAuditLog({
      userId: auth.payload.userId,
      action: isTransfer ? "TRANSFER" : "UPDATE",
      resource: "owners",
      resourceId: id,
      details: isTransfer
        ? { ...previousOwnerDetails, newOwnerName: owner.ownerName, newCnic: owner.cnic, transferNote }
        : parsed.data,
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(owner);
  } catch (err) {
    console.error("Admin owner update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "owners");
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await dbConnect();
    const owner = await Owner.findByIdAndDelete(id);
    if (!owner) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await createAuditLog({
      userId: auth.payload.userId,
      action: "DELETE",
      resource: "owners",
      resourceId: id,
      details: { ownerName: owner.ownerName },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin owner delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
