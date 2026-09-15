import type { NextRequest } from "next/server";

const store = new Map<string, { count: number; resetAt: number }>();

const REQUESTS = parseInt(process.env.RATE_LIMIT_REQUESTS || "60", 10);
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10);

export function rateLimit(request: NextRequest): {
  ok: boolean;
  remaining: number;
  retryAfter: number;
} {
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const now = Date.now();

  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: REQUESTS - 1, retryAfter: 0 };
  }

  if (entry.count >= REQUESTS) {
    return { ok: false, remaining: 0, retryAfter: entry.resetAt - now };
  }

  entry.count += 1;
  return { ok: true, remaining: REQUESTS - entry.count, retryAfter: 0 };
}
