import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { BookingRequest, Unit } from "@/lib/db/models";
import { bookingRequestSchema } from "@/validations/booking";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(`booking:${ip}`, 10)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = bookingRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, phone, email, unitId, message } = parsed.data;

    await dbConnect();

    const unit = await Unit.findById(unitId);
    if (!unit) {
      return NextResponse.json(
        { error: "Unit not found" },
        { status: 404 }
      );
    }

    if (unit.status !== "available" && unit.status !== "reserved") {
      return NextResponse.json(
        { error: "This unit is not available for booking" },
        { status: 400 }
      );
    }

    const booking = await BookingRequest.create({
      name,
      phone,
      email: email || undefined,
      unitId,
      message: message || undefined,
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      id: booking._id,
      message: "Booking request submitted successfully.",
    });
  } catch (err) {
    console.error("Booking error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
