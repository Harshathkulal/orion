import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { ipFilter } from "@/lib/ip-filter";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

/**
 * IP filtering and rate limiting to protect API endpoints.
 * @param req - The incoming Next.js request object
 * @param userId - Optional authenticated user ID
 * @param limit - Max allowed requests (default: 10)
 * @param interval - Time window in ms (default: 60_000ms)
 * @returns `NextResponse` if blocked or rate limited, otherwise `null`
 */
export async function applyApiProtection(
  req: NextRequest,
  userId?: string,
  limit = 10,
  interval = 60_000
): Promise<NextResponse | null> {
  const clientIp =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (ipFilter.isBlocked(clientIp)) {
    logger.warn("Blocked IP", { clientIp });
    return NextResponse.json({ message: "Access denied" }, { status: 403 });
  }

  const identifier = userId
    ? `user:${userId}`
    : `ip:${createHash("sha256").update(clientIp).digest("hex")}`;

  try {
    await rateLimit.check(identifier, limit, interval);
    return null;
  } catch (error) {
    logger.warn("Rate limit exceeded", { clientIp, userId, error });

    return new NextResponse(JSON.stringify({ message: "Too many requests" }), {
      status: 429,
      headers: {
        "Retry-After": String(interval / 1000),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
      },
    });
  }
}
