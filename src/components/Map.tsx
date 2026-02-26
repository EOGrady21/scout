"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Location } from "@/types";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function RatingBadge({ rating }: { rating: number | null | undefined }) {
  if (!rating) return null;
  const color =
    rating >= 4
      ? "bg-green-500"
      : rating >= 3
        ? "bg-yellow-500"
        : "bg-red-500";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-white text-xs font-semibold ${color}`}
    >
      {rating.toFixed(1)} ★
    </span>
  );
}

function FitBounds({ locations }: { locations: Location[] }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length === 0) return;
    const bounds = L.latLngBounds(
      locations.map((l) => [l.latitude, l.longitude])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [locations, map]);
  return null;
}

interface MapProps {
  locations: Location[];
}

export default function Map({ locations }: MapProps) {
  return (
    <MapContainer
      center={[39.5, -98.35]}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <div className="min-w-[180px]">
              <p className="font-semibold text-base mb-1">{location.name}</p>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {location.description}
              </p>
              <div className="flex items-center justify-between">
                <RatingBadge rating={location.latest_rating} />
                <Link
                  href={`/locations/${location.id}`}
                  className="text-sm text-scout-green font-medium hover:underline"
                >
                  View →
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
      {locations.length > 0 && <FitBounds locations={locations} />}
    </MapContainer>
  );
}
