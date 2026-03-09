"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons broken by webpack.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type SubmitPinMapProps = {
  latitude: string;
  longitude: string;
  onSelect: (latitude: number, longitude: number) => void;
};

function ClickToPlacePin({ onSelect }: { onSelect: SubmitPinMapProps["onSelect"] }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function RecenterOnSelection({
  position,
}: {
  position: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.flyTo(position, 13, { duration: 0.4 });
  }, [map, position]);

  return null;
}

export default function SubmitPinMap({ latitude, longitude, onSelect }: SubmitPinMapProps) {
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);

  const hasValidCoordinates =
    Number.isFinite(parsedLatitude) &&
    Number.isFinite(parsedLongitude) &&
    parsedLatitude >= -90 &&
    parsedLatitude <= 90 &&
    parsedLongitude >= -180 &&
    parsedLongitude <= 180;

  const selectedPosition: [number, number] | null = hasValidCoordinates
    ? [parsedLatitude, parsedLongitude]
    : null;

  return (
    <MapContainer
      center={selectedPosition ?? [39.5, -98.35]}
      zoom={selectedPosition ? 13 : 4}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickToPlacePin onSelect={onSelect} />

      {selectedPosition && (
        <Marker
          position={selectedPosition}
          draggable
          eventHandlers={{
            dragend(event) {
              const marker = event.target as L.Marker;
              const coords = marker.getLatLng();
              onSelect(coords.lat, coords.lng);
            },
          }}
        >
          <Popup>Selected location</Popup>
        </Marker>
      )}

      <RecenterOnSelection position={selectedPosition} />
    </MapContainer>
  );
}
