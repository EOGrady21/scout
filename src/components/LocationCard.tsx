import Link from "next/link";
import { Location, RATING_LABELS } from "@/types";

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  const rating = location.latest_rating
    ? Math.round(location.latest_rating)
    : null;

  return (
    <Link
      href={`/locations/${location.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-5"
    >
      <h3 className="font-semibold text-gray-900 text-lg mb-1">
        {location.name}
      </h3>
      <p className="text-gray-500 text-sm line-clamp-2 mb-3">
        {location.description}
      </p>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          {location.condition_count ?? 0} report
          {location.condition_count !== 1 ? "s" : ""}
        </span>
        {rating && (
          <span
            className={`px-2 py-0.5 rounded font-semibold text-white text-xs ${
              rating >= 4
                ? "bg-green-500"
                : rating >= 3
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
          >
            {RATING_LABELS[rating]}
          </span>
        )}
      </div>
    </Link>
  );
}
