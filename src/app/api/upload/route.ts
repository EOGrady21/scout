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

type UploadErrorLike = {
  message?: string;
  http_code?: number;
  status?: number;
};

function toUploadErrorResponse(err: unknown): { error: string; status: number } {
  const uploadErr = err as UploadErrorLike;
  const rawMessage = uploadErr?.message ?? "";
  const message = rawMessage.toLowerCase();

  if (/cloudinary_(cloud_name|api_key|api_secret)/i.test(rawMessage)) {
    return {
      error: "Image upload service is not configured on the server.",
      status: 500,
    };
  }

  if (/(request entity too large|payload too large|file size too large|max file size|too large|413)/i.test(message)) {
    return { error: PHOTO_UPLOAD_LIMIT_MESSAGE, status: 400 };
  }

  const inferredStatus =
    typeof uploadErr?.http_code === "number"
      ? uploadErr.http_code
      : typeof uploadErr?.status === "number"
        ? uploadErr.status
        : 500;

  const status = inferredStatus >= 400 && inferredStatus < 600 ? inferredStatus : 500;

  if (rawMessage) {
    return { error: `Photo upload failed: ${rawMessage}`, status };
  }

  return { error: "Failed to upload image", status: 500 };
}

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
    const { error, status } = toUploadErrorResponse(err);
    return addRateLimitHeaders(NextResponse.json(
      { error },
      { status }
    ), rateLimit);
  }
}
