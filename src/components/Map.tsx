"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { Location } from "@/types";
import { QUICK_TAGS } from "@/lib/tags";
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

type BoundsShape = {
  south: number;
  north: number;
  west: number;
  east: number;
};

const USER_LOCATION_RADIUS_METERS = 50_000;

function getRadiusBounds(latitude: number, longitude: number, radiusMeters: number) {
  const earthCircumferenceMeters = 40_075_017;
  const latDelta = (radiusMeters / earthCircumferenceMeters) * 360;
  const latRad = (latitude * Math.PI) / 180;
  const cosLat = Math.max(Math.cos(latRad), 1e-6);
  const lngDelta = latDelta / cosLat;

  return L.latLngBounds(
    [latitude - latDelta, longitude - lngDelta],
    [latitude + latDelta, longitude + lngDelta]
  );
}

function MapBoundsListener({ onBoundsChange }: { onBoundsChange: (bounds: BoundsShape) => void }) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onBoundsChange({
        south: b.getSouth(),
        north: b.getNorth(),
        west: b.getWest(),
        east: b.getEast(),
      });
    },
    zoomend: () => {
      const b = map.getBounds();
      onBoundsChange({
        south: b.getSouth(),
        north: b.getNorth(),
        west: b.getWest(),
        east: b.getEast(),
      });
    },
  });

  const emitBounds = useCallback(() => {
    const b = map.getBounds();
    onBoundsChange({
      south: b.getSouth(),
      north: b.getNorth(),
      west: b.getWest(),
      east: b.getEast(),
    });
  }, [map, onBoundsChange]);

  useEffect(() => {
    emitBounds();
  }, [emitBounds]);

  return null;
}

function UserLocationInitializer() {
  const map = useMap();
  const initializedRef = useRef(false);

  useEffect(() => {
    let disposed = false;

    if (initializedRef.current || typeof navigator === "undefined" || !navigator.geolocation) {
      return () => {
        disposed = true;
      };
    }

    initializedRef.current = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (disposed) return;
        const container = map.getContainer();
        if (!container || !container.isConnected) return;

        const bounds = getRadiusBounds(
          coords.latitude,
          coords.longitude,
          USER_LOCATION_RADIUS_METERS
        );
        try {
          map.fitBounds(bounds, { padding: [24, 24] });
        } catch {
          // Ignore stale-map race conditions from remounts.
        }
      },
      () => {
        // Keep the default continental view if location access fails or is denied.
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );

    return () => {
      disposed = true;
    };
  }, [map]);

  return null;
}

interface MapProps {
  initialLocations: Location[];
}

export default function Map({ initialLocations }: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [bounds, setBounds] = useState<BoundsShape | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(keywordInput.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keywordInput]);

  useEffect(() => {
    if (!bounds) return;

    const params = new URLSearchParams({
      south: String(bounds.south),
      north: String(bounds.north),
      west: String(bounds.west),
      east: String(bounds.east),
    });

    selectedTags.forEach((tag) => params.append("tag", tag));
    if (keyword) params.set("q", keyword);

    const controller = new AbortController();

    const runSearch = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/locations?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to search locations");
        }

        const data = (await response.json()) as Location[];
        setLocations(data);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Map search failed", err);
        setError("Could not search this area right now.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void runSearch();

    return () => controller.abort();
  }, [bounds, keyword, selectedTags]);

  const resultLabel = useMemo(() => {
    if (locations.length === 1) return "1 place in view";
    return `${locations.length} places in view`;
  }, [locations.length]);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((value) => value !== tag)
        : [...current, tag]
    );
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-3 right-3 top-3 z-[1000] rounded-lg border border-gray-200 bg-white/95 p-3 shadow-md backdrop-blur-sm sm:left-4 sm:right-auto sm:w-[28rem]">
        <div>
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Search title or description"
            className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm text-gray-800 outline-none ring-scout-green/30 focus:ring"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_TAGS.map((tag) => {
            const selected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selected
                    ? "border-[#0b6038] bg-[#0b6038] text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                }`}
                aria-pressed={selected}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
          <span>{resultLabel}</span>
          {isLoading ? <span>Searching area...</span> : <span>Pan or zoom to refresh</span>}
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

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
        <UserLocationInitializer />
        <MapBoundsListener onBoundsChange={setBounds} />
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
      </MapContainer>
    </div>
  );
}
