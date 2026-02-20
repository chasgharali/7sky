import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Unit, Owner, Payment, BookingRequest, PaymentPlan } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { findPlanRow, countUnitsInShopNo } from "@/lib/findPlanRow";

function getNextDueDate(
  ownerCreatedAt: Date,
  amountPaid: number,
  planRow: { downpayment: number; quarterlyInstalment: number; onPossession: number; remaining: number }
): string | null {
  const start = new Date(ownerCreatedAt);
  const installments: { dueDate: Date; amount: number }[] = [];

  if (planRow.downpayment > 0) {
    installments.push({ dueDate: new Date(start), amount: planRow.downpayment });
  }

  const numQ = planRow.quarterlyInstalment > 0
    ? Math.min(Math.round(planRow.remaining / planRow.quarterlyInstalment), 16)
    : 0;

  for (let i = 1; i <= numQ; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i * 3);
    installments.push({ dueDate: d, amount: planRow.quarterlyInstalment });
  }

  if (planRow.onPossession > 0) {
    installments.push({ dueDate: new Date("2029-12-31"), amount: planRow.onPossession });
  }

  let remaining = amountPaid;
  for (const inst of installments) {
    if (remaining >= inst.amount) {
      remaining -= inst.amount;
    } else {
      return inst.dueDate.toISOString().split("T")[0];
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "dashboard");
  if (!auth.success) return auth.response;

  try {
    await dbConnect();

    const [units, owners, revenueByMonth, pendingBookings, plans, unitsValue] = await Promise.all([
      Unit.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Owner.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amountPaid" },
            totalPending: { $sum: "$pendingAmount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Payment.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      BookingRequest.countDocuments({ status: "pending" }),
      PaymentPlan.find({}).lean(),
      Unit.aggregate([{ $group: { _id: null, total: { $sum: "$price" } } }]),
    ]);

    const statusCounts = Object.fromEntries(
      units.map((u: { _id: string; count: number }) => [u._id, u.count])
    );
    const totalUnits =
      (statusCounts.available || 0) +
      (statusCounts.booked || 0) +
      (statusCounts.reserved || 0);
    const ownerStats = owners[0] || { totalRevenue: 0, totalPending: 0, count: 0 };

    const soldUnits = statusCounts.booked || 0;
    const reservedUnits = statusCounts.reserved || 0;
    const bookingPct = totalUnits > 0 ? Math.round(((soldUnits + reservedUnits) / totalUnits) * 100) : 0;

    const dueAlerts = await Owner.find({ pendingAmount: { $gt: 0 } })
      .populate("unitId", "unitNumber floor")
      .sort({ pendingAmount: -1 })
      .limit(10)
      .lean();

    const plansByFloor = new Map<string, (typeof plans)[number]>(plans.map((p) => [p.floor, p]));

    const alertsWithDue = dueAlerts.map((o) => {
      const unit = o.unitId as { unitNumber?: string; floor?: string } | null;
      let nextDue: string | null = null;

      if (unit?.floor && unit?.unitNumber) {
        const plan = plansByFloor.get(unit.floor);
        if (plan) {
          const row = findPlanRow(plan.rows, unit.unitNumber);
          if (row) {
            nextDue = getNextDueDate(new Date(o.createdAt as Date), o.amountPaid, {
              downpayment: row.downpayment,
              quarterlyInstalment: row.quarterlyInstalment,
              onPossession: row.onPossession,
              remaining: row.remaining,
            });
          }
        }
      }

      return {
        id: o._id,
        ownerName: o.ownerName,
        registrationNumber: o.registrationNumber,
        unitNumber: unit?.unitNumber,
        totalAmount: o.totalAmount,
        amountPaid: o.amountPaid,
        pendingAmount: o.pendingAmount,
        nextDue,
      };
    });

    return NextResponse.json({
      totalUnits,
      availableUnits: statusCounts.available || 0,
      soldUnits,
      reservedUnits,
      totalRevenue: ownerStats.totalRevenue,
      outstandingPayments: ownerStats.totalPending,
      totalOwners: ownerStats.count,
      bookingPct,
      pendingBookingRequests: pendingBookings,
      revenueByMonth: revenueByMonth || [],
      dueAlerts: alertsWithDue,
      totalUnitsValue: unitsValue[0]?.total || 0,
      totalArea: plans.reduce(
        (sum: number, p) => sum + p.rows.reduce((rs: number, r) => rs + (r.totalArea || 0) * countUnitsInShopNo(r.shopNo), 0),
        0
      ),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
