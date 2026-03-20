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
  <div className="relative flex h-[calc(100vh-3.5rem)]">

    {/* ===== MOBILE NAV CONTROLS (MANUAL FRONT-END EDIT SECTION) =====
        Adjust IDs, labels, and responsive classes here to customize mobile menu behavior.
    */}
    <input id="mobile-nav-toggle" type="checkbox" className="peer sr-only" aria-label="Toggle menu" />
    <label
      htmlFor="mobile-nav-toggle"
      className="md:hidden fixed top-[4.15rem] left-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-800 shadow-sm"
      aria-controls="mobile-left-drawer"
    >
      <span className="text-xl leading-none">☰</span>
    </label>

    <label
      htmlFor="mobile-nav-toggle"
      className="mobile-drawer-overlay md:hidden fixed inset-0 z-20 bg-black/40 opacity-0 pointer-events-none transition-opacity duration-200 peer-checked:opacity-100 peer-checked:pointer-events-auto"
      aria-hidden="true"
    />

    <aside
      id="mobile-left-drawer"
      className="mobile-left-drawer md:hidden fixed top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-64 bg-[#0b6038] text-white p-4 overflow-y-auto -translate-x-full transition-transform duration-200 peer-checked:translate-x-0"
    >
      <nav>
        <ul className="space-y-2">
          <li><a href="#main-page" className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">My Home</a></li>
          <li><a href="#conditions" className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Conditions</a></li>
          <li><a href="#map-view" className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Map View</a></li>
          <li><a href="#add-trail-report" className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Add a Trail Report</a></li>
        </ul>
      </nav>
    </aside>

    {/* ===== LEFT SIDEBAR ===== */}
    <aside className="hidden md:block w-64 bg-[#0b6038] text-white flex-shrink-0 sticky top-0 h-full overflow-hidden p-4">
      <nav>
        <ul className="space-y-2">
          <li><a href="#main-page"            className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">My Home</a></li>
          <li><a href="#conditions"           className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Conditions</a></li>
          <li><a href="#map-view"             className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Map View</a></li>
          <li><a href="#add-new-trail"      className="block px-3 py-2 rounded hover:bg-gray-300 hover:text-black transition-colors">Add New Trail</a></li>
        </ul>
      </nav>
    </aside>

    {/* ===== SCROLLABLE MAIN CONTENT ===== */}
    <div className="flex-1 overflow-y-auto pt-16 md:pt-0">

      <section id="main-page" className="p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Welcome Scout!</h2>
        <p>Review trails and outdoor spaces in your community in our web app. Sign in to get started. Your adventure awaits!</p>
        {/* Your content here */}
      </section>

      <section id="conditions" className="p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Live Conditions Feed</h2>
        <LiveConditionsFeed conditions={recentConditions} initialCount={5} />
      </section>

      <section id="map-view" className="p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Map View</h2>
        {/* The existing map component goes here */}
        <div className="h-[360px] md:h-[500px] relative rounded-lg overflow-hidden">
          <MapWrapper locations={locations} />
        </div>
      </section>

      <section id="add-trail-report" className="p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">Add a Trail Report</h2>
        {!session ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 flex flex-col items-center text-center gap-4 max-w-md mx-auto">
            <p className="text-gray-600">
              You must be logged in with Google to submit a new trail or report.
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
