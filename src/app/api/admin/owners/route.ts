import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Owner, PaymentPlan } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { ownerSchema } from "@/validations/owner";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";
import { findPlanRow } from "@/lib/findPlanRow";

function getNextDueDate(
  ownerCreatedAt: Date,
  amountPaid: number,
  row: { downpayment: number; quarterlyInstalment: number; onPossession: number; remaining: number }
): string | null {
  const start = new Date(ownerCreatedAt);
  const installments: { dueDate: Date; amount: number }[] = [];

  if (row.downpayment > 0) installments.push({ dueDate: new Date(start), amount: row.downpayment });

  const numQ = row.quarterlyInstalment > 0
    ? Math.min(Math.round(row.remaining / row.quarterlyInstalment), 16) : 0;
  for (let i = 1; i <= numQ; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i * 3);
    installments.push({ dueDate: d, amount: row.quarterlyInstalment });
  }

  if (row.onPossession > 0) installments.push({ dueDate: new Date("2027-12-31"), amount: row.onPossession });

  let rem = amountPaid;
  for (const inst of installments) {
    if (rem >= inst.amount) { rem -= inst.amount; } else {
      return inst.dueDate.toISOString().split("T")[0];
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "owners");
  if (!auth.success) return auth.response;

  try {
    await dbConnect();
    const [owners, plans] = await Promise.all([
      Owner.find({}).populate("unitId", "unitNumber floor type price status").sort({ createdAt: -1 }).lean(),
      PaymentPlan.find({}).lean(),
    ]);

    const plansByFloor = new Map(plans.map((p) => [p.floor, p]));

    const result = owners.map((o) => {
      const unit = o.unitId as { unitNumber?: string; floor?: string } | null;
      let nextDue: string | null = null;
      if (unit?.floor && unit?.unitNumber) {
        const plan = plansByFloor.get(unit.floor);
        if (plan) {
          const row = findPlanRow(plan.rows, unit.unitNumber!);
          if (row) {
            nextDue = getNextDueDate(new Date(o.createdAt as Date), o.amountPaid, {
              downpayment: row.downpayment, quarterlyInstalment: row.quarterlyInstalment,
              onPossession: row.onPossession, remaining: row.remaining,
            });
          }
        }
      }
      return { ...o, nextDue };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Admin owners list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, "owners");
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const parsed = ownerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    await dbConnect();

    const regNo = parsed.data.registrationNumber ||
      `7SKY-${Math.floor(100000 + Math.random() * 900000)}`;

    const owner = await Owner.create({
      ...parsed.data,
      registrationNumber: regNo,
      pendingAmount: parsed.data.totalAmount - (parsed.data.amountPaid || 0),
    });

    await createAuditLog({
      userId: auth.payload.userId,
      action: "CREATE",
      resource: "owners",
      resourceId: String(owner._id),
      details: { registrationNumber: owner.registrationNumber },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(owner);
  } catch (err) {
    console.error("Admin owner create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
