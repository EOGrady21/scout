import { NextRequest, NextResponse } from "next/server";
import { getLocationsWithFilters, createLocation, upsertUser } from "@/lib/db";
import { auth } from "@/lib/auth";
import { MAP_FILTER_TAGS } from "@/lib/tags";
import {
  addRateLimitHeaders,
  applyRateLimit,
  RATE_LIMIT_CONFIG,
  rateLimitExceededResponse,
} from "@/lib/rate-limit";

function parseCoordinate(value: string | null, min: number, max: number): number | undefined {
  if (value == null || value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error("Invalid coordinate");
  }
  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const south = parseCoordinate(searchParams.get("south"), -90, 90);
    const north = parseCoordinate(searchParams.get("north"), -90, 90);
    const west = parseCoordinate(searchParams.get("west"), -180, 180);
    const east = parseCoordinate(searchParams.get("east"), -180, 180);

    if (south != null && north != null && south > north) {
      return NextResponse.json(
        { error: "Invalid bounds: south cannot be greater than north" },
        { status: 400 }
      );
    }

    const tags = Array.from(
      new Set(
        searchParams
          .getAll("tag")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      )
    );

    const invalidTag = tags.find(
      (tag) => !MAP_FILTER_TAGS.includes(tag as (typeof MAP_FILTER_TAGS)[number])
    );
    if (invalidTag) {
      return NextResponse.json(
        { error: `Invalid map filter tag: ${invalidTag}` },
        { status: 400 }
      );
    }

    const rawQuery = searchParams.get("q");
    const query = rawQuery?.trim() ? rawQuery.trim() : undefined;

    const locations = await getLocationsWithFilters({
      south,
      north,
      west,
      east,
      tags,
      query,
    });

    const safeLocations = locations.map(({ created_by, ...location }) => location);
    return NextResponse.json(safeLocations);
  } catch (err) {
    console.error("GET /api/locations error:", err);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = applyRateLimit({
    request,
    namespace: "locations",
    limit: RATE_LIMIT_CONFIG.locations.limit,
    windowMs: RATE_LIMIT_CONFIG.locations.windowMs,
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
    const { name, description, latitude, longitude } = body;

    if (!name || !description || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (
      isNaN(lat) ||
      isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates" },
        { status: 400 }
      );
    }

    const location = await createLocation({
      name: String(name).trim(),
      description: String(description).trim(),
      latitude: lat,
      longitude: lon,
      created_by: user.id,
    });

    const { created_by, ...safeLocation } = location;
    return addRateLimitHeaders(NextResponse.json(safeLocation, { status: 201 }), rateLimit);
  } catch (err) {
    console.error("POST /api/locations error:", err);
    return addRateLimitHeaders(NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    ), rateLimit);
  }
}