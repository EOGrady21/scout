import { getLocations, getRecentConditions } from "@/lib/db";
import MapWrapper from "@/components/MapWrapper";
import Link from "next/link";
import { Location, RecentConditionFeedItem } from "@/types";
import { auth } from "@/lib/auth";
import SignInButton from "@/components/SignInButton";
import LiveConditionsFeed from "@/components/LiveConditionsFeed";
import Image from "next/image";
import { getUserBadgeProgress } from "@/lib/db";
import HomeMobileNav from "@/components/HomeMobileNav";


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
    <HomeMobileNav />

   
{/* ===== LEFT SIDEBAR ===== */}
<aside className="hidden md:block w-64 bg-[#0b6038] text-white flex-shrink-0 fixed top-0 left-0 h-screen overflow-hidden flex flex-col z-50 p-4">

  {/* Decorative mountains */}
  <svg className="absolute bottom-0 left-0 w-full opacity-[0.04] pointer-events-none" viewBox="0 0 230 300" fill="none">
    <polygon points="0,300 80,120 160,300" fill="white"/>
    <polygon points="70,300 160,80 250,300" fill="white"/>
  </svg>

  {/* Scout Logo */}
  <div className="px-20 pt-3 pb-2 border-b border-white/15">
    <Link href="/">
      <img src="/badges/logoWhite.svg" alt="SCOUT" className="h-15 w-auto" /> 
    </Link>
  </div>

  <nav className="pl-4 pt-3 flex-1 overflow-y-auto">
    <ul className="space-y-3">
      <li>
        <Link 
          href="#main-page" 
          className="group flex items-center gap-3 px-6 py-2 rounded-lg text-lg font-medium w-52 hover:bg-gray-300 hover:text-black transition-colors block"
        >
          <img src="/badges/whome.svg" alt="home" className="w-6 h-6 flex-shrink-0 group-hover:hidden" />
          <img src="/badges/bhome.svg" alt="home" className="w-6 h-6 flex-shrink-0 hidden group-hover:block" />
          My Home
        </Link>
      </li>

      <li>
        <Link 
          href="#conditions" 
          className="group flex items-center gap-3 px-6 py-2 rounded-lg text-lg font-medium w-52 hover:bg-gray-300 hover:text-black transition-colors block"
        >
          <img src="/badges/wcondition.svg" alt="Conditions" className="w-6 h-6 flex-shrink-0 group-hover:hidden" />
          <img src="/badges/bcondition.svg" alt="Conditions" className="w-6 h-6 flex-shrink-0 hidden group-hover:block" />
          Conditions
        </Link>
      </li>    

      <li>
        <Link 
          href="#map-view" 
          className="group flex items-center gap-3 px-6 py-2 rounded-lg text-lg font-medium w-52 hover:bg-gray-300 hover:text-black transition-colors block"
        >
          <img src="/badges/wmap.svg" alt="map view" className="w-6 h-6 flex-shrink-0 group-hover:hidden" />
          <img src="/badges/bmap.svg" alt="map view" className="w-6 h-6 flex-shrink-0 hidden group-hover:block" />
          Map View
        </Link>
      </li>

      <li>
        <Link 
          href="#add-trail-report" 
          className="group flex items-center gap-3 px-6 py-2 rounded-lg text-lg font-medium w-52 hover:bg-gray-300 hover:text-black transition-colors block"
        >
          <img src="/badges/wnewtrail.svg" alt="Trail" className="w-6 h-6 flex-shrink-0 group-hover:hidden" />
          <img src="/badges/bnewtrail.svg" alt="Trail" className="w-6 h-6 flex-shrink-0 hidden group-hover:block" />
          Add a Trail
        </Link>
      </li>
    </ul>
  </nav>
</aside>





{/* ===== SCROLLABLE MAIN CONTENT ===== */}
<div className="flex-1 overflow-y-auto pt-16 md:pt-0 md:ml-64"> 


        
        {/* 4.New Welcome SECTION BOX */}
           <section id="main-page" className="scroll-mt-20 p-4 md:p-6 border-b border-gray-200">
            <div className="bg-[#0b6038] rounded-2xl px-8 py-8 text-white relative overflow-hidden">

              {/* Decorative */}
              <svg className="absolute right-0 top-0 h-full w-1/2 opacity-[0.06] pointer-events-none" viewBox="0 0 400 200" fill="none">
              <polygon points="80,190 180,20 280,190" fill="white" strokeWidth="1.5"/>
              <polygon points="180,190 280,60 380,190" fill="white" strokeWidth="1.5"/>
              <polygon points="260,190 340,90 420,190" fill="white" strokeWidth="1.5"/>
              </svg>

              
               <p className="text-white/60 text-xs uppercase tracking-widest mb-2">Live Community Updates</p>
                <h2 className="text-2xl font-bold mb-2">
                  {session ? `Hi, ${session.user?.name?.split(" ")[0]}! 👋` : "Welcome to Scout! 👋"}
                  </h2>
                  <p className="text-white/60 text-sm mb-6 max-w-md">
                  {session? "Great to see you out there! Ready to share live conditions or explore new trails near you?"
                  : "Discover real-time conditions of places you want to visit, share what you see, and help others explore safely. Sign in to get started. Your adventure awaits!"}
                  </p>
                <div className="flex gap-3">
                  <Link href="#map-view" className="bg-white/20 hover:bg-white/30 transition-colors text-white text-sm font-semibold px-5 py-2 rounded-lg">
                  Explore Map →
                  </Link>

                </div>
             </div>
         </section>


      <section id="conditions" className="scroll-mt-20 p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Live Conditions Feed</h2>
        <LiveConditionsFeed conditions={recentConditions} initialCount={5} />
      </section>

      <section id="map-view" className="scroll-mt-20 p-4 md:p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold mb-4">Map View</h2>
        {/* The existing map component goes here */}
        <div className="h-[360px] md:h-[500px] relative rounded-lg overflow-hidden">
          <MapWrapper locations={locations} />
        </div>
      </section>

            <section id="add-trail-report" className="scroll-mt-20 p-4 md:p-6 border-b border-gray-200">
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
            Add a Trail 
          </Link>
        )}
      </section>

      <footer className="px-4 py-6 md:px-6 text-center text-xs text-gray-500">
        <p>
          By using Scout, you agree to our {" "}
          <Link href="/privacy" className="underline hover:text-gray-700 transition-colors">
            Privacy Policy
          </Link>
          {" "}and can {" "}
          <a
            href="https://github.com/EOGrady21/scout/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-700 transition-colors"
          >
            contact us
          </a>
          {" "}on GitHub.
        </p>
      </footer>

    </div>
    </div>

);
}
