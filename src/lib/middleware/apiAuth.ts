import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, verifyToken, JWTPayload } from "@/lib/auth/jwt";

export type UserRole = "super_admin" | "accounts_manager" | "sales_manager";

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ["*"],
  accounts_manager: ["owners", "payments", "dashboard"],
  sales_manager: ["units", "bookings", "media", "dashboard"],
};

function hasPermission(role: UserRole, resource: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (permissions.includes("*")) return true;
  return permissions.some((p) => resource.startsWith(p) || resource === p);
}

export async function requireAuth(
  request: NextRequest,
  resource: string = "*"
): Promise<{ success: true; payload: JWTPayload } | { success: false; response: NextResponse }> {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    return {
      success: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return {
      success: false,
      response: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }

  const role = payload.role as UserRole;
  if (!hasPermission(role, resource)) {
    return {
      success: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { success: true, payload };
}

export { getAuthToken, verifyToken };
