"use client";

import dynamic from "next/dynamic";

const ClientLocationDetailMap = dynamic(() => import("@/components/LocationDetailMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100" />,
});

type LocationDetailMapWrapperProps = {
  latitude: number;
  longitude: number;
  name: string;
};

export default function LocationDetailMapWrapper({ latitude, longitude, name }: LocationDetailMapWrapperProps) {
  return (
    <ClientLocationDetailMap
      latitude={latitude}
      longitude={longitude}
      name={name}
    />
  );
}
