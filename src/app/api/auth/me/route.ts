import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/apiAuth";
import dbConnect from "@/lib/db/connection";
import { User } from "@/lib/db/models";

export async function GET(request: Request) {
  const auth = await requireAuth(request as import("next/server").NextRequest);

  if (!auth.success) return auth.response;

  await dbConnect();
  const user = await User.findById(auth.payload.userId)
    .select("-passwordHash")
    .lean();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
}
