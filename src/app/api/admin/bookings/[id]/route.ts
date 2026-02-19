import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import { BookingRequest, Unit } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request, "bookings");
  if (!auth.success) return auth.response;

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();
    const status = body?.status;
    if (!status || !["approved", "rejected", "reserved", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Use approved, rejected, reserved or pending" },
        { status: 400 }
      );
    }

    await dbConnect();
    const booking = await BookingRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("unitId", "unitNumber floor type price");

    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Sync the linked unit's status to reflect the booking decision
    if (booking.unitId) {
      const unitStatusMap: Record<string, string> = {
        reserved: "reserved",
        approved: "booked",
        rejected: "available",
        pending: "available",
      };
      await Unit.findByIdAndUpdate(booking.unitId, { status: unitStatusMap[status] });
    }

    await createAuditLog({
      userId: auth.payload.userId,
      action: "UPDATE",
      resource: "bookings",
      resourceId: id,
      details: { status },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(booking);
  } catch (err) {
    console.error("Admin booking update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
