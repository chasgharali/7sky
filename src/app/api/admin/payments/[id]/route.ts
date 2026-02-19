import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import { Payment, Owner } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "payments");
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await dbConnect();
    const payment = await Payment.findByIdAndDelete(id);
    if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Reverse the owner's amountPaid / pendingAmount
    const owner = await Owner.findById(payment.ownerId);
    if (owner) {
      const newPaid = Math.max(0, owner.amountPaid - payment.amount);
      await Owner.updateOne(
        { _id: owner._id },
        { amountPaid: newPaid, pendingAmount: owner.totalAmount - newPaid }
      );
    }

    await createAuditLog({
      userId: auth.payload.userId,
      action: "DELETE",
      resource: "payments",
      resourceId: id,
      details: { amount: payment.amount },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin payment delete error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
