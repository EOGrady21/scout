import { NextRequest, NextResponse } from "next/server";
import { createCondition, upsertUser } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
   // Ensure FK parent row exists in users (prod-safe for stale sessions)
  if (!session.user.email) {
    return NextResponse.json(
      { error: "Missing user email in session" },
      { status: 400 }
    );
  }

  await upsertUser({
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email,
    image: session.user.image ?? null,
  });

  try {
    const body = await request.json();
    const { location_id, condition_date, rating, description, photo_url } = body;

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

    const condition = await createCondition({
      location_id: String(location_id),
      user_id: session.user.id,
      condition_date: String(condition_date),
      rating: ratingNum,
      description: String(description).trim(),
      photo_url: photo_url ? String(photo_url) : null,
    });

    return NextResponse.json(condition, { status: 201 });
  } catch (err) {
    console.error("POST /api/conditions error:", err);
    return NextResponse.json(
      { error: "Failed to submit condition" },
      { status: 500 }
    );
  }
}
