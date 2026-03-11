"use client";

import { useEffect } from "react";
import { Circle, MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const STATIC_RADIUS_METERS = 5_000;

// Fix default marker icons broken by webpack.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function StaticRadiusView({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();

  useEffect(() => {
    const center = L.latLng(latitude, longitude);
    const bounds = center.toBounds(STATIC_RADIUS_METERS);

    // Ensure the map has measured dimensions before fitting bounds.
    map.invalidateSize(false);
    map.fitBounds(bounds, { padding: [0, 0], animate: false });
  }, [latitude, longitude, map]);

  return null;
}

type StaticLocationMapProps = {
  latitude: number;
  longitude: number;
  locationName: string;
};

export default function StaticLocationMap({ latitude, longitude, locationName }: StaticLocationMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      boxZoom={false}
      keyboard={false}
      touchZoom={false}
      zoomControl={false}
      attributionControl={false}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <StaticRadiusView latitude={latitude} longitude={longitude} />
      <Circle
        center={[latitude, longitude]}
        radius={STATIC_RADIUS_METERS}
        pathOptions={{ color: "#0b6038", fillColor: "#0b6038", fillOpacity: 0.12, weight: 2 }}
      />
      <Marker position={[latitude, longitude]}>
        {/* Popup intentionally omitted to keep this map static. */}
      </Marker>
      <span className="sr-only">Map preview for {locationName}</span>
    </MapContainer>
  );
}
