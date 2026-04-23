import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { Owner } from "@/lib/db/models";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || token.length < 10) {
      return NextResponse.json({ valid: false, error: "Invalid verification token" }, { status: 400 });
    }

    await dbConnect();
    const owner = await Owner.findOne({ verificationToken: token })
      .populate("unitId", "unitNumber floor type")
      .lean();

    if (!owner) {
      return NextResponse.json({ valid: false, error: "Ownership record not found" }, { status: 404 });
    }

    const latestTransfer = owner.transferHistory?.[owner.transferHistory.length - 1];
    return NextResponse.json({
      valid: true,
      ownerName: owner.ownerName,
      registrationNumber: owner.registrationNumber,
      cnic: owner.cnic,
      unit: owner.unitId
        ? {
            unitNumber: (owner.unitId as { unitNumber?: string }).unitNumber || "-",
            floor: (owner.unitId as { floor?: string }).floor || "-",
            type: (owner.unitId as { type?: string }).type || "-",
          }
        : null,
      verifiedAt: new Date().toISOString(),
      lastTransferDate: latestTransfer?.transferredAt || null,
    });
  } catch (err) {
    console.error("Ownership verify error:", err);
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}
