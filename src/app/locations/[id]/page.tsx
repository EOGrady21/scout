import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getLocationById, getConditionsByLocationId } from "@/lib/db";
import { auth } from "@/lib/auth";
import ConditionForm from "@/components/ConditionForm";
import { Condition, Location, RATING_LABELS } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 0;

function RatingBadge({ rating }: { rating: number }) {
  const color =
    rating >= 4
      ? "bg-green-500"
      : rating >= 3
        ? "bg-yellow-500"
        : "bg-red-500";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white ${color}`}
    >
      {rating}★ {RATING_LABELS[rating]}
    </span>
  );
}

export default async function LocationPage({ params }: PageProps) {
  const { id } = await params;
  let location: Location | null = null;
  let conditions: Condition[] = [];

  try {
    [location, conditions] = await Promise.all([
      getLocationById(id),
      getConditionsByLocationId(id),
    ]);
  } catch {
    // DB unavailable — notFound will handle the null case below
  }

  if (!location) notFound();

  const session = await auth();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Location header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {location.name}
        </h1>
        <p className="text-gray-600 mb-3">{location.description}</p>
        <p className="text-sm text-gray-400">
          {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        </p>
      </div>

      {/* Condition reports */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Condition Reports
          {conditions.length > 0 && (
            <span className="ml-2 text-base font-normal text-gray-400">
              ({conditions.length})
            </span>
          )}
        </h2>

        {conditions.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No condition reports yet. Be the first!
          </p>
        ) : (
          <div className="space-y-6">
            {conditions.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {c.user_image && (
                      <Image
                        src={c.user_image}
                        alt={c.user_name ?? "User"}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-gray-700">
                      {c.user_name ?? "Anonymous"}
                    </span>
                  </div>
                  <RatingBadge rating={c.rating} />
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  Conditions as of{" "}
                  {new Date(c.condition_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-700 text-sm">{c.description}</p>
                {c.photo_url && (
                  <div className="mt-3 relative h-56 rounded-lg overflow-hidden">
                    <Image
                      src={c.photo_url}
                      alt="Condition photo"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add condition form */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Add a Condition Report
        </h2>
        {session ? (
          <ConditionForm locationId={id} />
        ) : (
          <p className="text-gray-500 text-sm">
            Please{" "}
            <Link href="/" className="text-scout-green hover:underline font-medium">
              sign in
            </Link>{" "}
            to submit a condition report.
          </p>
        )}
      </section>
    </div>
  );
}
