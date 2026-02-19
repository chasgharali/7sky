import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import { Owner, PaymentPlan } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { findPlanRow } from "@/lib/findPlanRow";

interface InstallmentItem {
  label: string;
  dueDate: string;
  amount: number;
  status: "paid" | "overdue" | "upcoming";
}

function buildSchedule(
  ownerCreatedAt: Date,
  amountPaid: number,
  planRow: {
    downpayment: number;
    quarterlyInstalment: number;
    onPossession: number;
    remaining: number;
  }
): InstallmentItem[] {
  const start = new Date(ownerCreatedAt);
  const items: { label: string; dueDate: Date; amount: number }[] = [];
  const now = new Date();

  if (planRow.downpayment > 0) {
    items.push({ label: "Downpayment", dueDate: new Date(start), amount: planRow.downpayment });
  }

  const numQ =
    planRow.quarterlyInstalment > 0
      ? Math.min(Math.round(planRow.remaining / planRow.quarterlyInstalment), 16)
      : 0;

  for (let i = 1; i <= numQ; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i * 3);
    items.push({ label: `Quarterly Instalment ${i}`, dueDate: d, amount: planRow.quarterlyInstalment });
  }

  if (planRow.onPossession > 0) {
    items.push({ label: "On Possession", dueDate: new Date("2027-12-31"), amount: planRow.onPossession });
  }

  let remaining = amountPaid;
  return items.map((inst) => {
    const paid = remaining >= inst.amount;
    remaining = Math.max(0, remaining - inst.amount);
    let status: "paid" | "overdue" | "upcoming";
    if (paid) {
      status = "paid";
    } else if (inst.dueDate < now) {
      status = "overdue";
    } else {
      status = "upcoming";
    }
    return {
      label: inst.label,
      dueDate: inst.dueDate.toISOString().split("T")[0],
      amount: inst.amount,
      status,
    };
  });
}

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
      .populate("unitId", "unitNumber floor type price")
      .lean();

    if (!owner) {
      return NextResponse.json({ error: "Owner not found" }, { status: 404 });
    }

    const unit = owner.unitId as unknown as {
      unitNumber: string;
      floor: string;
      type?: string;
      price?: number;
    } | null;

    let installmentSchedule: InstallmentItem[] = [];
    let planFound = false;

    if (unit?.floor && unit?.unitNumber) {
      const plan = await PaymentPlan.findOne({ floor: unit.floor }).lean();
      if (plan) {
        const row = findPlanRow(plan.rows, unit.unitNumber);
        if (row) {
          planFound = true;
          installmentSchedule = buildSchedule(
            new Date(owner.createdAt as Date),
            owner.amountPaid,
            {
              downpayment: row.downpayment,
              quarterlyInstalment: row.quarterlyInstalment,
              onPossession: row.onPossession,
              remaining: row.remaining,
            }
          );
        }
      }
    }

    const paidCount = installmentSchedule.filter((i) => i.status === "paid").length;
    const overdueCount = installmentSchedule.filter((i) => i.status === "overdue").length;
    const upcomingCount = installmentSchedule.filter((i) => i.status === "upcoming").length;

    return NextResponse.json({
      ownerName: owner.ownerName,
      unitNumber: unit?.unitNumber ?? "N/A",
      unitFloor: unit?.floor,
      unitType: unit?.type,
      totalAmount: owner.totalAmount,
      amountPaid: owner.amountPaid,
      pendingAmount: owner.pendingAmount,
      planFound,
      installmentSchedule,
      paidCount,
      overdueCount,
      upcomingCount,
    });
  } catch (err) {
    console.error("Admin owner installments error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
