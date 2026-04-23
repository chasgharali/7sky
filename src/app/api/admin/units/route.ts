import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Owner, Unit } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { unitSchema } from "@/validations/unit";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "units");
  if (!auth.success) return auth.response;

  try {
    await dbConnect();
    const [units, owners] = await Promise.all([
      Unit.find({}).sort({ floor: 1, unitNumber: 1 }).lean(),
      Owner.find({}).select("unitId ownerName").lean(),
    ]);

    const ownerMap = new Map<string, string>();
    owners.forEach((o) => {
      ownerMap.set(String(o.unitId), o.ownerName);
    });

    const enrichedUnits = units.map((u) => ({
      ...u,
      currentOwnerName: ownerMap.get(String(u._id)) || null,
    }));

    return NextResponse.json(enrichedUnits);
  } catch (err) {
    console.error("Admin units list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, "units");
  if (!auth.success) return auth.response;

  try {
    const body = await request.json();
    const parsed = unitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    await dbConnect();
    const unit = await Unit.create(parsed.data);

    await createAuditLog({
      userId: auth.payload.userId,
      action: "CREATE",
      resource: "units",
      resourceId: String(unit._id),
      details: { unitNumber: unit.unitNumber },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(unit);
  } catch (err) {
    console.error("Admin unit create error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
