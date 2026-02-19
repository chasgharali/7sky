import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Payment, Owner } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { paymentSchema } from "@/validations/payment";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "payments");
  if (!auth.success) return auth.response;

  try {
    await dbConnect();
    const ownerId = request.nextUrl.searchParams.get("ownerId");
    const filter = ownerId ? { ownerId } : {};
    const payments = await Payment.find(filter)
      .populate("ownerId", "ownerName registrationNumber")
      .sort({ date: -1 })
      .lean();
    return NextResponse.json(payments);
  } catch (err) {
    console.error("Admin payments list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, "payments");
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    await dbConnect();

    const owner = await Owner.findById(parsed.data.ownerId);
    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    const payment = await Payment.create({
      ...parsed.data,
      date: parsed.data.date || new Date(),
      createdBy: auth.payload.userId,
    });

    const newAmountPaid = owner.amountPaid + payment.amount;
    const newPending = owner.totalAmount - newAmountPaid;
    await Owner.updateOne(
      { _id: owner._id },
      { amountPaid: newAmountPaid, pendingAmount: Math.max(0, newPending) }
    );

    await createAuditLog({
      userId: auth.payload.userId,
      action: "CREATE",
      resource: "payments",
      resourceId: String(payment._id),
      details: { amount: payment.amount, ownerId: String(owner._id) },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(payment);
  } catch (err) {
    console.error("Admin payment create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
