import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

// Configure lazily so the module can be imported at build time even when
// Cloudinary env vars are not yet set (e.g. during `next build` in CI).
function configureCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name) throw new Error("CLOUDINARY_CLOUD_NAME environment variable is not set");
  if (!api_key) throw new Error("CLOUDINARY_API_KEY environment variable is not set");
  if (!api_secret) throw new Error("CLOUDINARY_API_SECRET environment variable is not set");
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

export { cloudinary };

export async function uploadImage(
  fileBuffer: Buffer,
  folder = "scout"
): Promise<string> {
  configureCloudinary();
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "image" }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed"));
        } else {
          resolve(result.secure_url);
        }
      })
      .end(fileBuffer);
  });
}
