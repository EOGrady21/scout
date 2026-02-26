"use client";

import dynamic from "next/dynamic";
import { Location } from "@/types";

// Leaflet requires browser APIs — must be dynamically imported inside a Client Component
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapWrapper({ locations }: { locations: Location[] }) {
  return <Map locations={locations} />;
}
