import { NextRequest, NextResponse } from "next/server";
import { getLocationById, getConditionsByLocationId } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const location = await getLocationById(params.id);
    if (!location) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    const conditions = await getConditionsByLocationId(params.id);
    return NextResponse.json({ ...location, conditions });
  } catch (err) {
    console.error("GET /api/locations/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}
