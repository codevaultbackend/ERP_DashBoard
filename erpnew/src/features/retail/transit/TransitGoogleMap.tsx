"use client";

import { useEffect, useMemo, useState } from "react";
import type { TransitTransfer } from "./types";
import { getLiveLocationApi } from "@/features/retail/request/api/tracking-api";

type Props = {
  item: TransitTransfer;
  large?: boolean;
  preview?: boolean;
  height?: number | string;
  clickable?: boolean;
  onClick?: () => void;
};

type LiveLocation = {
  latitude: number | null;
  longitude: number | null;
  updated_at?: string | null;
};

function toNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function getTransferId(item: any) {
  return item?.id || item?.transfer_id || item?.transferId || item?.transfer?.id;
}

export default function TransitGoogleMap({
  item,
  large = false,
  preview = false,
  height = 250,
  clickable = false,
  onClick,
}: Props) {
  const transferId = getTransferId(item);

  const [liveLocation, setLiveLocation] = useState<LiveLocation>({
    latitude:
      toNumber((item as any)?.last_latitude) ||
      toNumber((item as any)?.latitude) ||
      null,
    longitude:
      toNumber((item as any)?.last_longitude) ||
      toNumber((item as any)?.longitude) ||
      null,
    updated_at: (item as any)?.last_tracked_at || null,
  });

  const destination = useMemo(() => {
    return {
      address:
        (item as any)?.delivery_address ||
        (item as any)?.destination_address ||
        (item as any)?.to_address ||
        "Destination",
      latitude:
        toNumber((item as any)?.drop_lat) ||
        toNumber((item as any)?.destination_latitude),
      longitude:
        toNumber((item as any)?.drop_lng) ||
        toNumber((item as any)?.destination_longitude),
    };
  }, [item]);

  useEffect(() => {
    if (!transferId) return;

    let mounted = true;

    async function fetchLiveLocation() {
      try {
        const res = await getLiveLocationApi(transferId);
        const data = res?.data;

        if (!mounted) return;

        setLiveLocation({
          latitude: toNumber(data?.live_location?.latitude),
          longitude: toNumber(data?.live_location?.longitude),
          updated_at: data?.live_location?.updated_at || null,
        });
      } catch (error) {
        console.error("Failed to fetch live location:", error);
      }
    }

    fetchLiveLocation();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLiveLocation();
      }
    }, large ? 5000 : 10000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, [transferId, large]);

  const hasVehicleLocation =
    liveLocation.latitude !== null && liveLocation.longitude !== null;

    const mapSrc = useMemo(() => {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return "";

  // 🎯 decide focus point
  const focusLat = liveLocation.latitude ?? destination.latitude;
  const focusLng = liveLocation.longitude ?? destination.longitude;

  if (focusLat && focusLng) {
    
    return `https://www.google.com/maps/embed/v1/view?key=${key}&center=${focusLat},${focusLng}&zoom=12&maptype=roadmap`;
  }

  const destinationQuery =
    destination.latitude && destination.longitude
      ? `${destination.latitude},${destination.longitude}`
      : encodeURIComponent(destination.address);

  return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${destinationQuery}&zoom=12`;
}, [destination, liveLocation]);

  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!clickable) return;
        if (event.key === "Enter" || event.key === " ") onClick?.();
      }}
      className={[
        "relative w-full overflow-hidden bg-[#F5F1EA]",
        preview ? "rounded-[24px]" : "",
        clickable ? "cursor-pointer" : "",
      ].join(" ")}
      style={{ height }}
    >
      {mapSrc ? (
        <>
          <iframe
            src={mapSrc}
            className="h-full w-full border-0"
            loading="lazy"
            allowFullScreen
          />

          {/* 🔥 THIS FIXES YOUR CLICK ISSUE */}
          {preview && (
            <div
              onClick={onClick}
              className="absolute inset-0 z-10 cursor-pointer"
            />
          )}
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#F5F1EA] px-5 text-center">
          <p className="max-w-[440px] text-[14px] font-medium leading-[22px] text-[#667085]">
            Add{" "}
            <span className="font-semibold text-[#111827]">
              NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            </span>{" "}
            in your env file.
          </p>
        </div>
      )}
    </div>
  );
}