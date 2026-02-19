import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { signToken, setAuthCookie } from "@/lib/auth/jwt";
import { loginSchema } from "@/validations/auth";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { createAuditLog } from "@/lib/audit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimit(`auth:${ip}`, 30)) {
    return NextResponse.json(
      { error: "Too many attempts" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    await dbConnect();
    const user = await User.findOne({ email }).lean();

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    const token = await signToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    await createAuditLog({
      userId: String(user._id),
      action: "LOGIN",
      resource: "auth",
      ip,
      userAgent: request.headers.get("user-agent") || undefined,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
