import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Owner, PaymentPlan } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { findPlanRow } from "@/lib/findPlanRow";

interface PopulatedUnit {
  _id: string;
  unitNumber: string;
  floor: string;
}

interface PopulatedOwner {
  _id: string;
  ownerName: string;
  totalAmount: number;
  amountPaid: number;
  pendingAmount: number;
  createdAt: Date;
  unitId: PopulatedUnit | null;
}

interface InstallmentAlert {
  ownerId: string;
  ownerName: string;
  unitNumber: string;
  installmentLabel: string;
  dueDate: string;
  amount: number;
  type: "overdue" | "upcoming";
}

/**
 * Derives an installment schedule from the payment plan row.
 *
 * Structure:
 *  - Downpayment: at owner.createdAt
 *  - Quarterly instalments: every 3 months starting from createdAt + 3mo
 *  - On Possession: project completion (Dec 2027, configurable)
 *
 * We compute how many quarterly instalments fit:
 *   numQuarterly = round(remaining / quarterlyInstalment)  (capped at 16)
 *
 * Then cross-check against amountPaid to determine which are paid.
 */
function buildSchedule(
  owner: PopulatedOwner,
  planRow: {
    downpayment: number;
    quarterlyInstalment: number;
    onPossession: number;
    remaining: number;
  }
) {
  const start = new Date(owner.createdAt);
  const installments: { label: string; dueDate: Date; amount: number }[] = [];

  // 1. Downpayment
  if (planRow.downpayment > 0) {
    installments.push({ label: "Downpayment", dueDate: new Date(start), amount: planRow.downpayment });
  }

  // 2. Quarterly instalments
  const numQ =
    planRow.quarterlyInstalment > 0
      ? Math.min(Math.round(planRow.remaining / planRow.quarterlyInstalment), 16)
      : 0;

  for (let i = 1; i <= numQ; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i * 3);
    installments.push({
      label: `Quarterly Instalment ${i}`,
      dueDate: d,
      amount: planRow.quarterlyInstalment,
    });
  }

  // 3. On Possession
  if (planRow.onPossession > 0) {
    installments.push({
      label: "On Possession",
      dueDate: new Date("2027-12-31"),
      amount: planRow.onPossession,
    });
  }

  // Mark paid by greedy accumulation
  let remaining = owner.amountPaid;
  return installments.map((inst) => {
    const paid = remaining >= inst.amount;
    remaining = Math.max(0, remaining - inst.amount);
    return { ...inst, paid };
  });
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "dashboard");
  if (!auth.success) return auth.response;

  try {
    await dbConnect();

    const owners = (await Owner.find({})
      .populate("unitId", "unitNumber floor")
      .lean()) as unknown as PopulatedOwner[];

    const plans = await PaymentPlan.find({}).lean();

    const now = new Date();
    const in30Days = new Date(now);
    in30Days.setDate(in30Days.getDate() + 30);

    const overdue: InstallmentAlert[] = [];
    const upcoming30Days: InstallmentAlert[] = [];

    for (const owner of owners) {
      if (!owner.unitId) continue;
      const unit = owner.unitId;

      // Map floor value to PaymentPlan floor key
      const floorKey = unit.floor;
      const plan = plans.find((p) => p.floor === floorKey);
      if (!plan) continue;

      // Find matching row in plan
      const row = findPlanRow(plan.rows, unit.unitNumber);
      if (!row || !row.quarterlyInstalment) continue;

      const schedule = buildSchedule(owner, {
        downpayment: row.downpayment,
        quarterlyInstalment: row.quarterlyInstalment,
        onPossession: row.onPossession,
        remaining: row.remaining,
      });

      for (const inst of schedule) {
        if (inst.paid) continue;

        const alert: InstallmentAlert = {
          ownerId: String(owner._id),
          ownerName: owner.ownerName,
          unitNumber: unit.unitNumber,
          installmentLabel: inst.label,
          dueDate: inst.dueDate.toISOString().split("T")[0],
          amount: inst.amount,
          type: inst.dueDate < now ? "overdue" : "upcoming",
        };

        if (inst.dueDate < now) {
          overdue.push(alert);
        } else if (inst.dueDate <= in30Days) {
          upcoming30Days.push(alert);
        }
      }
    }

    // Sort overdue by most overdue first
    overdue.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    upcoming30Days.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    return NextResponse.json({
      overdue,
      upcoming30Days,
      overdueCount: overdue.length,
      upcomingCount: upcoming30Days.length,
    });
  } catch (err) {
    console.error("Installments API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
