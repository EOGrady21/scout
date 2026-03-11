import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import {
  addRateLimitHeaders,
  applyRateLimit,
  RATE_LIMIT_CONFIG,
  rateLimitExceededResponse,
} from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const PHOTO_UPLOAD_LIMIT_MESSAGE = "Photo upload size limit 4MB";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = applyRateLimit({
    request,
    namespace: "upload",
    limit: RATE_LIMIT_CONFIG.upload.limit,
    windowMs: RATE_LIMIT_CONFIG.upload.windowMs,
    userId: session.user.id,
  });

  if (!rateLimit.allowed) {
    return rateLimitExceededResponse(rateLimit);
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
        { status: 400 }
      );
    }

    // Keep under common serverless request body limits in production.
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: PHOTO_UPLOAD_LIMIT_MESSAGE },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const url = await uploadImage(buffer);

    return addRateLimitHeaders(NextResponse.json({ url }), rateLimit);
  } catch (err) {
    console.error("POST /api/upload error:", err);
    return addRateLimitHeaders(NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    ), rateLimit);
  }
}
