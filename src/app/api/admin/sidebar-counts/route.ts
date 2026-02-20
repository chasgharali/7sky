import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { BookingRequest, Owner, PaymentPlan } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { findPlanRow } from "@/lib/findPlanRow";

interface PopulatedUnit { _id: string; unitNumber: string; floor: string; }
interface PopulatedOwner {
  _id: string; ownerName: string; amountPaid: number;
  createdAt: Date; unitId: PopulatedUnit | null;
}

function countOverdue(
  owner: PopulatedOwner,
  row: { downpayment: number; quarterlyInstalment: number; onPossession: number; remaining: number }
): number {
  const start = new Date(owner.createdAt);
  const now = new Date();
  const installments: { dueDate: Date; amount: number }[] = [];

  if (row.downpayment > 0) installments.push({ dueDate: new Date(start), amount: row.downpayment });

  const numQ = row.quarterlyInstalment > 0
    ? Math.min(Math.round(row.remaining / row.quarterlyInstalment), 16)
    : 0;
  for (let i = 1; i <= numQ; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i * 3);
    installments.push({ dueDate: d, amount: row.quarterlyInstalment });
  }
  if (row.onPossession > 0) installments.push({ dueDate: new Date("2029-12-31"), amount: row.onPossession });

  let remaining = owner.amountPaid;
  let overdue = 0;
  for (const inst of installments) {
    if (remaining >= inst.amount) { remaining -= inst.amount; continue; }
    if (inst.dueDate < now) overdue++;
  }
  return overdue;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "dashboard");
  if (!auth.success) return auth.response;

  try {
    await dbConnect();

    const [pendingBookings, owners, plans] = await Promise.all([
      BookingRequest.countDocuments({ status: "pending" }),
      Owner.find({}).populate("unitId", "unitNumber floor").lean() as unknown as Promise<PopulatedOwner[]>,
      PaymentPlan.find({}).lean(),
    ]);

    let overdueInstallments = 0;
    for (const owner of owners) {
      if (!owner.unitId) continue;
      const plan = plans.find((p) => p.floor === owner.unitId!.floor);
      if (!plan) continue;
      const row = findPlanRow(plan.rows, owner.unitId!.unitNumber);
      if (!row || !row.quarterlyInstalment) continue;
      overdueInstallments += countOverdue(owner, {
        downpayment: row.downpayment,
        quarterlyInstalment: row.quarterlyInstalment,
        onPossession: row.onPossession,
        remaining: row.remaining,
      });
    }

    return NextResponse.json({ pendingBookings, overdueInstallments });
  } catch (err) {
    console.error("Sidebar counts error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
