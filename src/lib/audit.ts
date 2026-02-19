import { AuditLog } from "@/lib/db/models";
import dbConnect from "@/lib/db/connection";

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await dbConnect();
    await AuditLog.create(params);
  } catch (err) {
    console.error("Audit log error:", err);
  }
}
