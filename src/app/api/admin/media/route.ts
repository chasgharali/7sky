import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import dbConnect from "@/lib/db/connection";
import { Media } from "@/lib/db/models";
import { requireAuth } from "@/lib/middleware/apiAuth";
import { createAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/rateLimit";

const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO = ["video/mp4"];
const ALLOWED_PDF = ["application/pdf"];
const MAX_IMAGE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO = 50 * 1024 * 1024; // 50MB
const MAX_PDF = 20 * 1024 * 1024; // 20MB

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, "media");
  if (!auth.success) return auth.response;

  try {
    await dbConnect();
    const category = request.nextUrl.searchParams.get("category");
    const filter = category ? { category } : {};
    const media = await Media.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json(media);
  } catch (err) {
    console.error("Admin media list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request, "media");
  if (!auth.success) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;
    const category = formData.get("category") as string;

    if (!file || !type || !category) {
      return NextResponse.json(
        { error: "file, type, and category are required" },
        { status: 400 }
      );
    }

    const mime = file.type;
    let allowed = false;
    let maxSize = 0;

    if (type === "image" && ALLOWED_IMAGE.includes(mime)) {
      allowed = true;
      maxSize = MAX_IMAGE;
    } else if (type === "video" && ALLOWED_VIDEO.includes(mime)) {
      allowed = true;
      maxSize = MAX_VIDEO;
    } else if (type === "pdf" && ALLOWED_PDF.includes(mime)) {
      allowed = true;
      maxSize = MAX_PDF;
    }

    if (!allowed) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: jpeg, png, webp, mp4, pdf" },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name) || (type === "pdf" ? ".pdf" : ".bin");
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", category);
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const url = `/uploads/${category}/${filename}`;

    await dbConnect();
    const media = await Media.create({
      type: type as "image" | "video" | "pdf",
      category: category as "floorplan" | "paymentplan" | "gallery",
      url,
      filename: file.name,
      metadata: { originalName: file.name, size: file.size },
      uploadedBy: auth.payload.userId,
    });

    await createAuditLog({
      userId: auth.payload.userId,
      action: "UPLOAD",
      resource: "media",
      resourceId: String(media._id),
      details: { filename: file.name, category },
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json(media);
  } catch (err) {
    console.error("Admin media upload error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
