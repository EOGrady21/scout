import { NextRequest, NextResponse } from "next/server";
import { getLocations, createLocation } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const locations = await getLocations();
    return NextResponse.json(locations);
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

  try {
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
      created_by: session.user.id,
    });

    return NextResponse.json(location, { status: 201 });
  } catch (err) {
    console.error("POST /api/locations error:", err);
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}
