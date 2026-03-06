import { getLocations } from "@/lib/db";
import LocationCard from "@/components/LocationCard";
import MapWrapper from "@/components/MapWrapper";
import Link from "next/link";
import { Location } from "@/types";
import SubmitPage from "@/app/submit/page";


export const revalidate = 60;

export default async function HomePage() {
  let locations: Location[] = [];
  try {
    locations = await getLocations();
  } catch {
    // DB may not be configured during development
  }

return (
  <div className="flex h-[calc(100vh-3.5rem)]">

    {/* ===== LEFT SIDEBAR ===== */}
    <aside className="w-64 bg-[#0b6038] text-white flex-shrink-0 sticky top-0 h-full overflow-hidden p-4">
      <nav>
        <ul className="space-y-2">
          <li><a href="#my-home"            className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">My Home</a></li>
          <li><a href="#trending-locations" className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Trending Locations</a></li>
          <li><a href="#map-view"           className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Map View</a></li>
          <li><a href="#conditions"         className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Conditions</a></li>
          <li><a href="#add-new-trail"       className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Add New Trail</a></li>
        </ul>
      </nav>
    </aside>

    {/* ===== SCROLLABLE MAIN CONTENT ===== */}
    <div className="flex-1 overflow-y-auto">

      <section id="my-home" className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">My Home</h2>
        {/* Your content here */}
      </section>

      <section id="trending-locations" className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Trending Locations</h2>
        {/* Location cards from the database go here */}
        <div className="space-y-3">
          {locations.length === 0 ? (
            <p className="text-gray-500 text-sm">No locations yet. <Link href="/submit" className="text-scout-green hover:underline">Be the first to add one!</Link></p>
          ) : (
            locations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))
          )}
        </div>
      </section>

      <section id="map-view" className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Map View</h2>
        {/* The existing map component goes here */}
        <div className="h-[500px] relative rounded-lg overflow-hidden">
          <MapWrapper locations={locations} />
        </div>
      </section>

      <section id="conditions" className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Conditions</h2>
        {/* Your content here */}
      </section>

      <section id="add-new-trail" className="p-6">
        <SubmitPage />
      </section>

    </div>
  </div>
);
}
