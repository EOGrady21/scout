"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RATING_LABELS } from "@/types";
import { QUICK_TAGS } from "@/lib/tags";

interface ConditionFormProps {
  locationId: string;
}

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const PHOTO_UPLOAD_LIMIT_MESSAGE = "Photo upload size limit 4MB";

type ApiErrorResponse = {
  error?: string;
};

export default function ConditionForm({ locationId }: ConditionFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState<number>(3);
  const [description, setDescription] = useState("");
  const [conditionDate, setConditionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function parseErrorMessage(
    response: Response,
    fallback: string
  ): Promise<string> {
    const text = await response.text();
    if (!text) return fallback;

    try {
      const data = JSON.parse(text) as ApiErrorResponse;
      if (data.error && /(too large|size limit|413)/i.test(data.error)) {
        return PHOTO_UPLOAD_LIMIT_MESSAGE;
      }
      return data.error ?? fallback;
    } catch {
      if (/(request entity too large|payload too large|file too large|413)/i.test(text)) {
        return PHOTO_UPLOAD_LIMIT_MESSAGE;
      }
      return fallback;
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    if (file && file.size > MAX_UPLOAD_BYTES) {
      setPhotoFile(null);
      setPhotoPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setError(PHOTO_UPLOAD_LIMIT_MESSAGE);
      return;
    }

    setPhotoFile(file);
    setError(null);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        if (photoFile.size > MAX_UPLOAD_BYTES) {
          throw new Error(PHOTO_UPLOAD_LIMIT_MESSAGE);
        }

        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const message = await parseErrorMessage(uploadRes, "Photo upload failed");
          throw new Error(message);
        }
        const uploadData = await uploadRes.json();
        photoUrl = uploadData.url;
      }

      const res = await fetch("/api/conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_id: locationId,
          condition_date: conditionDate,
          rating,
          description,
          photo_url: photoUrl,
          tags,
        }),
      });

      if (!res.ok) {
        const message = await parseErrorMessage(res, "Failed to submit condition");
        throw new Error(message);
      }

      setDescription("");
      setRating(3);
      setPhotoFile(null);
      setTags([]);
      setPhotoPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  }

  const ratingLabels = RATING_LABELS;

  function toggleTag(tag: string) {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag],
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date
        </label>
        <input
          type="date"
          value={conditionDate}
          onChange={(e) => setConditionDate(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-scout-green"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rating: <span className="text-scout-green">{ratingLabels[rating]}</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setRating(val)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                rating === val
                  ? "bg-scout-green text-white border-scout-green"
                  : "border-gray-300 text-gray-600 hover:border-scout-green"
              }`}
            >
              {val}★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          placeholder="Describe current conditions..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-scout-green resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quick Tags (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ${
                  active
                    ? "bg-scout-green text-white border-scout-green"
                    : "bg-white text-gray-600 border-gray-300 hover:border-scout-green"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Photo (optional)
        </label>
        {photoPreview && (
          <div className="mb-2 relative w-full h-40 rounded-lg overflow-hidden">
            <Image
              src={photoPreview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-scout-green file:text-white hover:file:bg-scout-dark"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-scout-green text-white py-2.5 rounded-lg font-medium hover:bg-scout-dark transition-colors disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit Condition Report"}
      </button>
    </form>
  );
}
