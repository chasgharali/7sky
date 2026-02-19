import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { PaymentPlan } from "@/lib/db/models";

/** Public GET /api/payment-plan — returns all floors for the public site */
export async function GET() {
  try {
    await dbConnect();
    const plans = await PaymentPlan.find().sort({ floor: 1 }).lean();
    return NextResponse.json(plans);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
