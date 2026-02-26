import { getLocations } from "@/lib/db";
import LocationCard from "@/components/LocationCard";
import MapWrapper from "@/components/MapWrapper";
import Link from "next/link";
import { Location } from "@/types";

export const revalidate = 60;

export default async function HomePage() {
  let locations: Location[] = [];
  try {
    locations = await getLocations();
  } catch {
    // DB may not be configured during development
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
      {/* Map panel */}
      <div className="flex-1 relative">
        <MapWrapper locations={locations} />
      </div>

      {/* Sidebar */}
      <aside className="w-full lg:w-80 xl:w-96 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Locations</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {locations.length} location{locations.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <div className="p-4 space-y-3 flex-1">
          {locations.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No locations yet.{" "}
              <Link href="/submit" className="text-scout-green hover:underline">
                Be the first to add one!
              </Link>
            </p>
          ) : (
            locations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
