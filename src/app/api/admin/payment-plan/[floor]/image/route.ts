import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import { PaymentPlan } from "@/lib/db/models";
import { createAuditLog } from "@/lib/audit";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { getClientIp } from "@/lib/rateLimit";
import {
  FLOOR_IDS,
  deleteFloorPlanImage,
  uploadFloorPlanImage,
  type FloorId,
} from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ floor: string }> }
) {
  const auth = await requireAuth(request, "dashboard");
  if (!auth.success) return auth.response;

  try {
    const { floor } = await params;
    if (!FLOOR_IDS.includes(floor as FloorId)) {
      return NextResponse.json({ error: "Invalid floor" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: jpeg, png, webp" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Image too large. Max 10MB." }, { status: 400 });
    }

    await dbConnect();
    const plan = await PaymentPlan.findOne({ floor });
    if (!plan) {
      return NextResponse.json({ error: "Floor plan not found" }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const uploaded = await uploadFloorPlanImage(Buffer.from(bytes), floor as FloorId, file.type);

    if (plan.floorImagePublicId && plan.floorImagePublicId !== uploaded.publicId) {
      await deleteFloorPlanImage(plan.floorImagePublicId);
    }

    plan.floorImageUrl = uploaded.secureUrl;
    plan.floorImagePublicId = uploaded.publicId;
    await plan.save();

    await createAuditLog({
      userId: auth.payload.userId,
      action: "UPLOAD",
      resource: "payment_plan",
      resourceId: String(plan._id),
      details: { floor, floorImagePublicId: uploaded.publicId },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      floor,
      floorImageUrl: plan.floorImageUrl,
      floorImagePublicId: plan.floorImagePublicId,
    });
  } catch (err) {
    console.error("Floor plan image upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
