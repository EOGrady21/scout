"use client";

import dynamic from "next/dynamic";
import { Location } from "@/types";

// Leaflet requires browser APIs — must be dynamically imported inside a Client Component
const ClientMap = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => <div className="h-full w-full" />,
});

export default function MapWrapper({ locations }: { locations: Location[] }) {
  return <ClientMap initialLocations={locations} />;
}
