import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { BookingRequest } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "bookings");
  if (!auth.success) return auth.response;

  try {
    await dbConnect();
    const status = request.nextUrl.searchParams.get("status");
    const filter = status ? { status } : {};
    const bookings = await BookingRequest.find(filter)
      .populate("unitId", "unitNumber floor type price status")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(bookings);
  } catch (err) {
    console.error("Admin bookings list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
