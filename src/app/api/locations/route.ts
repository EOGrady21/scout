import { NextRequest, NextResponse } from "next/server";
import { getLocations, createLocation, upsertUser } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  addRateLimitHeaders,
  applyRateLimit,
  RATE_LIMIT_CONFIG,
  rateLimitExceededResponse,
} from "@/lib/rate-limit";

export async function GET() {
  try {
    const locations = await getLocations();
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