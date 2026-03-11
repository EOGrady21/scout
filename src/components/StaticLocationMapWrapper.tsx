"use client";

import dynamic from "next/dynamic";

const ClientStaticLocationMap = dynamic(() => import("@/components/StaticLocationMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100" />,
});

type StaticLocationMapWrapperProps = {
  latitude: number;
  longitude: number;
  locationName: string;
};

export default function StaticLocationMapWrapper({
  latitude,
  longitude,
  locationName,
}: StaticLocationMapWrapperProps) {
  return (
    <ClientStaticLocationMap
      latitude={latitude}
      longitude={longitude}
      locationName={locationName}
    />
  );
}
