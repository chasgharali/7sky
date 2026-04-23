import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import { Owner } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";
import { deleteOwnerPhoto, uploadOwnerPhoto } from "@/lib/cloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(
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

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Photo file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: jpeg, png, webp" },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Photo too large. Max 5MB." }, { status: 400 });
    }

    await dbConnect();
    const owner = await Owner.findById(id);
    if (!owner) return NextResponse.json({ error: "Owner not found" }, { status: 404 });

    const bytes = await file.arrayBuffer();
    const upload = await uploadOwnerPhoto(Buffer.from(bytes), id, file.type);
    await deleteOwnerPhoto(owner.photoPublicId);

    owner.photoUrl = upload.secureUrl;
    owner.photoPublicId = upload.publicId;
    await owner.save();

    await createAuditLog({
      userId: auth.payload.userId,
      action: "UPLOAD",
      resource: "owners",
      resourceId: id,
      details: { photoPublicId: upload.publicId },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      photoUrl: owner.photoUrl,
      photoPublicId: owner.photoPublicId,
    });
  } catch (err) {
    console.error("Owner photo upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
