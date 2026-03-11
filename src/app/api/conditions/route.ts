import { NextRequest, NextResponse } from "next/server";
import { createCondition, upsertUser } from "@/lib/db";
import { auth } from "@/lib/auth";
import { QUICK_TAGS } from "@/lib/tags";
import {
  addRateLimitHeaders,
  applyRateLimit,
  RATE_LIMIT_CONFIG,
  rateLimitExceededResponse,
} from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = applyRateLimit({
    request,
    namespace: "conditions",
    limit: RATE_LIMIT_CONFIG.conditions.limit,
    windowMs: RATE_LIMIT_CONFIG.conditions.windowMs,
    userId: session.user.id,
  });

  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit);
  }

   // Ensure FK parent row exists in users (prod-safe for stale sessions)
  if (!session.user.email) {
    return NextResponse.json(
      { error: "Missing user email in session" },
      { status: 400 }
    );
  }

  try {
    const user = await upsertUser({
      id: session.user.id,
      name: session.user.name ?? null,
      email: session.user.email,
      image: session.user.image ?? null,
    });

    const body = await request.json();
    const { location_id, condition_date, rating, description, photo_url, tags } = body;

    if (!location_id || !condition_date || !rating || !description) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const parsedTags = Array.isArray(tags)
      ? tags
          .map((tag) => String(tag).trim().toLowerCase())
          .filter(Boolean)
      : [];

    const uniqueTags = Array.from(new Set(parsedTags));
    const invalidTag = uniqueTags.find((tag) => !QUICK_TAGS.includes(tag as (typeof QUICK_TAGS)[number]));
    if (invalidTag) {
      return NextResponse.json(
        { error: `Invalid quick tag: ${invalidTag}` },
        { status: 400 }
      );
    }

    const condition = await createCondition({
      location_id: String(location_id),
      user_id: user.id,
      condition_date: String(condition_date),
      rating: ratingNum,
      description: String(description).trim(),
      photo_url: photo_url ? String(photo_url) : null,
      tags: uniqueTags,
    });

    const { user_id, ...safeCondition } = condition;
    return addRateLimitHeaders(NextResponse.json(safeCondition, { status: 201 }), rateLimit);
  } catch (err) {
    console.error("POST /api/conditions error:", err);
    return addRateLimitHeaders(NextResponse.json(
      { error: "Failed to submit condition" },
      { status: 500 }
    ), rateLimit);
  }
}
