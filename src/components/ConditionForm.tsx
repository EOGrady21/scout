"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RATING_LABELS } from "@/types";

interface ConditionFormProps {
  locationId: string;
}

export default function ConditionForm({ locationId }: ConditionFormProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [rating, setRating] = useState<number>(3);
  const [description, setDescription] = useState("");
  const [conditionDate, setConditionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
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
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error ?? "Photo upload failed");
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
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to submit condition");
      }

      setDescription("");
      setRating(3);
      setPhotoFile(null);
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
