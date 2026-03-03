import { NextRequest, NextResponse } from "next/server";

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

type RateLimitOptions = {
  request: NextRequest;
  namespace: string;
  limit: number;
  windowMs: number;
  userId?: string | null;
};

type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitStore = Map<string, Bucket>;

declare global {
  var __scoutRateLimitStore: RateLimitStore | undefined;
}

const store: RateLimitStore = globalThis.__scoutRateLimitStore ?? new Map<string, Bucket>();
if (!globalThis.__scoutRateLimitStore) {
  globalThis.__scoutRateLimitStore = store;
}

function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  return "unknown";
}

function buildKey({ namespace, request, userId }: { namespace: string; request: NextRequest; userId?: string | null }): string {
  const ip = getClientIp(request);
  const subject = userId ? `user:${userId}` : `ip:${ip}`;
  return `${namespace}:${subject}`;
}

function cleanupExpiredEntries(now: number) {
  if (store.size <= 5000) return;
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export function applyRateLimit(options: RateLimitOptions): RateLimitResult {
  const { request, namespace, limit, windowMs, userId } = options;
  const now = Date.now();
  cleanupExpiredEntries(now);

  const key = buildKey({ namespace, request, userId });
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit,
      remaining: Math.max(limit - 1, 0),
      resetAt,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: existing.resetAt,
      retryAfterSeconds,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    limit,
    remaining: Math.max(limit - existing.count, 0),
    resetAt: existing.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function addRateLimitHeaders(response: NextResponse, result: RateLimitResult): NextResponse {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.floor(result.resetAt / 1000)));
  return response;
}

export function rateLimitExceededResponse(result: RateLimitResult): NextResponse {
  const response = NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 }
  );

  response.headers.set("Retry-After", String(result.retryAfterSeconds));
  return addRateLimitHeaders(response, result);
}

function readNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

export const RATE_LIMIT_CONFIG = {
  upload: {
    limit: readNumberEnv("RATE_LIMIT_UPLOAD_MAX", 10),
    windowMs: readNumberEnv("RATE_LIMIT_UPLOAD_WINDOW_MS", 60_000),
  },
  conditions: {
    limit: readNumberEnv("RATE_LIMIT_CONDITIONS_MAX", 20),
    windowMs: readNumberEnv("RATE_LIMIT_CONDITIONS_WINDOW_MS", 300_000),
  },
  locations: {
    limit: readNumberEnv("RATE_LIMIT_LOCATIONS_MAX", 10),
    windowMs: readNumberEnv("RATE_LIMIT_LOCATIONS_WINDOW_MS", 600_000),
  },
};