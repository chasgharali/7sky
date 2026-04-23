import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import { BookingRequest, Owner, Unit } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";
import { z } from "zod";

const finalizeOwnerSchema = z.object({
  ownerName: z.string().min(1).max(100),
  cnic: z.string().min(1).max(20),
  phone: z.string().max(20).optional().or(z.literal("")),
  residentOf: z.string().max(200).optional().or(z.literal("")),
  totalAmount: z.number().nonnegative(),
  amountPaid: z.number().nonnegative().default(0),
  discount: z.number().nonnegative().default(0),
});

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
    const finalizeOwner = body?.finalizeOwner;
    if (!status || !["approved", "rejected", "reserved", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Use approved, rejected, reserved or pending" },
        { status: 400 }
      );
    }
    if (finalizeOwner && status !== "approved") {
      return NextResponse.json(
        { error: "finalizeOwner is only allowed with approved status" },
        { status: 400 }
      );
    }

    const parsedFinalizeOwner = finalizeOwner
      ? finalizeOwnerSchema.safeParse(finalizeOwner)
      : null;
    if (parsedFinalizeOwner && !parsedFinalizeOwner.success) {
      return NextResponse.json(
        { error: parsedFinalizeOwner.error.issues?.[0]?.message || "Invalid owner details" },
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

    let ownerId: string | null = null;

    // Sync the linked unit's status to reflect the booking decision
    if (booking.unitId) {
      const unitStatusMap: Record<string, string> = {
        reserved: "reserved",
        approved: "booked",
        rejected: "available",
        pending: "available",
      };
      await Unit.findByIdAndUpdate(booking.unitId, { status: unitStatusMap[status] });

      if (status === "approved" && finalizeOwner) {
        const ownerData = parsedFinalizeOwner!.data;
        const pendingAmount = Math.max(0, ownerData.totalAmount - ownerData.amountPaid);

        const existingOwner = await Owner.findOne({ unitId: booking.unitId });
        if (existingOwner) {
          existingOwner.ownerName = ownerData.ownerName;
          existingOwner.cnic = ownerData.cnic;
          existingOwner.phone = ownerData.phone || "";
          existingOwner.residentOf = ownerData.residentOf || "";
          existingOwner.totalAmount = ownerData.totalAmount;
          existingOwner.discount = ownerData.discount;
          existingOwner.amountPaid = ownerData.amountPaid;
          existingOwner.pendingAmount = pendingAmount;
          await existingOwner.save();
          ownerId = String(existingOwner._id);
        } else {
          const createdOwner = await Owner.create({
            registrationNumber: `7SKY-${Math.floor(100000 + Math.random() * 900000)}`,
            ownerName: ownerData.ownerName,
            cnic: ownerData.cnic,
            phone: ownerData.phone || "",
            residentOf: ownerData.residentOf || "",
            unitId: booking.unitId,
            totalAmount: ownerData.totalAmount,
            discount: ownerData.discount,
            amountPaid: ownerData.amountPaid,
            pendingAmount,
          });
          ownerId = String(createdOwner._id);
        }
      }
    }

    await createAuditLog({
      userId: auth.payload.userId,
      action: "UPDATE",
      resource: "bookings",
      resourceId: id,
      details: { status, ownerCreatedOrUpdated: Boolean(ownerId) },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      ...booking.toObject(),
      ownerId,
      letterUrl: ownerId ? `/api/admin/owners/${ownerId}/letter?type=allotment` : null,
    });
  } catch (err) {
    console.error("Admin booking update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
