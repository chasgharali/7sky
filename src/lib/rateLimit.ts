const limitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes

function cleanup() {
  const now = Date.now();
  Array.from(limitMap.entries()).forEach(([key, value]) => {
    if (value.resetAt < now) limitMap.delete(key);
  });
}

if (typeof setInterval !== "undefined") {
  setInterval(cleanup, CLEANUP_INTERVAL);
}

export function rateLimit(identifier: string, limit: number): boolean {
  const now = Date.now();
  const entry = limitMap.get(identifier);

  if (!entry) {
    limitMap.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.resetAt < now) {
    entry.count = 1;
    entry.resetAt = now + WINDOW_MS;
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
