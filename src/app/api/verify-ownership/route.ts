import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Owner, PaymentPlan } from "@/lib/db/models";
import { verifyOwnershipSchema } from "@/validations/verifyOwnership";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
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
    return { label: inst.label, dueDate: inst.dueDate.toISOString().split("T")[0], amount: inst.amount, status };
  });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(`verify:${ip}`, 5)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = verifyOwnershipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { registrationNumber } = parsed.data;

    await dbConnect();

    const owner = await Owner.findOne({ registrationNumber: registrationNumber.trim() })
      .populate("unitId", "unitNumber floor type price")
      .lean();

    if (!owner) {
      return NextResponse.json(
        { error: "No record found for this registration number." },
        { status: 404 }
      );
    }

    const unit = owner.unitId as unknown as {
      unitNumber: string; floor: string; type: string; price: number;
    } | null;
    const unitNumber = unit?.unitNumber ?? "N/A";

    const { Payment } = await import("@/lib/db/models");
    const payments = await Payment.find({ ownerId: owner._id })
      .sort({ date: -1 })
      .select("amount date")
      .lean();

    // Build installment schedule if payment plan data is available
    let installmentSchedule: InstallmentItem[] = [];
    if (unit?.floor) {
      const plan = await PaymentPlan.findOne({ floor: unit.floor }).lean();
      if (plan) {
        const row = findPlanRow(plan.rows, unitNumber);
        if (row) {
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

    const nextDue = installmentSchedule.find((i) => i.status === "upcoming" || i.status === "overdue");
    const overdueCount = installmentSchedule.filter((i) => i.status === "overdue").length;

    return NextResponse.json({
      ownerName: owner.ownerName,
      unitNumber,
      unitFloor: unit?.floor,
      unitType: unit?.type,
      totalAmount: owner.totalAmount,
      amountPaid: owner.amountPaid,
      pendingAmount: owner.pendingAmount,
      paymentCount: payments.length,
      paymentHistorySummary: payments.map((p) => ({
        date: (p.date as Date).toISOString().split("T")[0],
        amount: p.amount,
      })),
      installmentSchedule,
      nextDueInstallment: nextDue ?? null,
      overdueCount,
    });
  } catch (err) {
    console.error("Verify ownership error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
