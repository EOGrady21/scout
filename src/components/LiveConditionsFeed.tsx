"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { RecentConditionFeedItem, RATING_LABELS } from "@/types";
import StaticLocationMapWrapper from "@/components/StaticLocationMapWrapper";

type LiveConditionsFeedProps = {
  conditions: RecentConditionFeedItem[];
  initialCount?: number;
};

const REPORTED_AT_FORMATTER = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "UTC",
});

function formatReportedAt(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return `${REPORTED_AT_FORMATTER.format(date)} UTC`;
}

function RatingBadge({ rating }: { rating: number }) {
  return (
    <span
      className={`px-2 py-0.5 rounded font-semibold text-white text-xs ${
        rating >= 4 ? "bg-green-500" : rating >= 3 ? "bg-yellow-500" : "bg-red-500"
      }`}
    >
      {RATING_LABELS[rating]}
    </span>
  );
}

export default function LiveConditionsFeed({ conditions, initialCount = 5 }: LiveConditionsFeedProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleConditions = useMemo(
    () => (showAll ? conditions : conditions.slice(0, initialCount)),
    [conditions, initialCount, showAll]
  );

  if (conditions.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No condition reports yet. <Link href="/submit" className="text-scout-green hover:underline">Be the first to add one!</Link>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {visibleConditions.map((condition) => (
        <article key={condition.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 mb-2">
                <Link
                  href={`/locations/${condition.location_id}`}
                  className="font-semibold text-gray-900 hover:underline"
                >
                  {condition.location_name}
                </Link>
                <RatingBadge rating={condition.rating} />
              </div>

              <p className="text-xs text-gray-500 mb-2">Reported {formatReportedAt(condition.created_at)}</p>

              <p className="text-sm text-gray-700 mb-3">{condition.description}</p>

              {condition.tags && condition.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {condition.tags.map((tag) => (
                    <span
                      key={`${condition.id}-${tag}`}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="w-1/4 min-w-[110px] max-w-[180px] self-start">
              {condition.photo_url ? (
                <Image
                  src={condition.photo_url}
                  alt={`Condition report for ${condition.location_name}`}
                  width={320}
                  height={192}
                  className="h-24 w-full rounded-lg object-cover border border-gray-100"
                />
              ) : (
                <div className="relative h-24 w-full overflow-hidden rounded-lg border border-gray-100">
                  <StaticLocationMapWrapper
                    latitude={condition.latitude}
                    longitude={condition.longitude}
                    locationName={condition.location_name}
                  />
                </div>
              )}
            </div>
          </div>
        </article>
      ))}

      {conditions.length > initialCount && (
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="text-sm font-medium text-scout-green hover:underline"
        >
          {showAll ? "Show less" : `See more (${conditions.length - initialCount} more)`}
        </button>
      )}
    </div>
  );
}
