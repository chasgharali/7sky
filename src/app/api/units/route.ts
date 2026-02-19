import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Unit } from "@/lib/db/models";

export const dynamic = "force-dynamic";

const FLOOR_VALUES = ["LGF", "GF", "1", "2", "3", "4", "5"] as const;
const STATUS_VALUES = ["available", "booked", "reserved"] as const;

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = request.nextUrl;
    const floor = searchParams.get("floor");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};

    if (floor && FLOOR_VALUES.includes(floor as (typeof FLOOR_VALUES)[number])) {
      filter.floor = floor;
    }
    if (status && STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])) {
      filter.status = status;
    }

    const units = await Unit.find(filter)
      .select("-__v")
      .sort({ floor: 1, unitNumber: 1 })
      .lean();

    return NextResponse.json(units);
  } catch (err) {
    console.error("Units list error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
