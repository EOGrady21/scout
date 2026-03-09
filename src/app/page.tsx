import { getLocations, getRecentConditions } from "@/lib/db";
import MapWrapper from "@/components/MapWrapper";
import Link from "next/link";
import { Location, RecentConditionFeedItem } from "@/types";
import { auth } from "@/lib/auth";
import SignInButton from "@/components/SignInButton";
import LiveConditionsFeed from "@/components/LiveConditionsFeed";


export const revalidate = 60;

export default async function HomePage() {
  const session = await auth();
  let locations: Location[] = [];
  let recentConditions: RecentConditionFeedItem[] = [];
  try {
    [locations, recentConditions] = await Promise.all([
      getLocations(),
      getRecentConditions(50),
    ]);
  } catch {
    // DB may not be configured during development
  }

return (
  <div className="flex h-[calc(100vh-3.5rem)]">

    {/* ===== LEFT SIDEBAR ===== */}
    <aside className="w-64 bg-[#0b6038] text-white flex-shrink-0 sticky top-0 h-full overflow-hidden p-4">
      <nav>
        <ul className="space-y-2">
          <li><a href="#main-page"            className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">My Home</a></li>
          <li><a href="#conditions"           className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Conditions</a></li>
          <li><a href="#map-view"             className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Map View</a></li>
          <li><a href="#add-trail-report"      className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Add a Trail Report</a></li>
        </ul>
      </nav>
    </aside>

    {/* ===== SCROLLABLE MAIN CONTENT ===== */}
    <div className="flex-1 overflow-y-auto">

      <section id="main-page" className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Welcome Scout!</h2>
        <p>Review trails and outdoor spaces in your community in our web app. Sign in to get started. Your adventure awaits!</p>
        {/* Your content here */}
      </section>

      <section id="conditions" className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Live Conditions Feed</h2>
        <LiveConditionsFeed conditions={recentConditions} initialCount={5} />
      </section>

      <section id="map-view" className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Map View</h2>
        {/* The existing map component goes here */}
        <div className="h-[500px] relative rounded-lg overflow-hidden">
          <MapWrapper locations={locations} />
        </div>
      </section>

      <section id="add-trail-report" className="p-6">
        <h2 className="text-xl font-bold mb-4">Add a Trail Report</h2>
        {!session ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
            <p className="text-gray-600">
              You must be logged in with Google to submit a trail report.
            </p>
            <SignInButton />
          </div>
        ) : (
          <Link
            href="/submit"
            className="inline-block bg-[#0b6038] text-white px-6 py-2 rounded hover:bg-[#094d2c] transition-colors font-medium"
          >
            Add a Trail Report
          </Link>
        )}
      </section>

    </div>
  </div>
);
}
