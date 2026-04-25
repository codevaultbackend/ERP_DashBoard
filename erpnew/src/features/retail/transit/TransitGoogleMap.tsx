"use client";

import { useEffect, useMemo, useState } from "react";
import { Expand, LocateFixed, MapPinned } from "lucide-react";
import type { TransitTransfer } from "./types";
import { cn, getMapPoints } from "./utils";

type LatLng = {
  lat: number;
  lng: number;
};

export default function TransitGoogleMap({
  item,
  height,
  large = false,
  clickable = false,
  onClick,
}: {
  item: TransitTransfer;
  height?: number;
  large?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}) {
  const points = useMemo(() => getMapPoints(item), [item]);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    if (points.length > 0) return;

    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => setLocationDenied(true),
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 60000,
      }
    );
  }, [points.length]);

  const primaryPoint =
    points[points.length - 1] ||
    (userLocation
      ? {
          lat: userLocation.lat,
          lng: userLocation.lng,
          label: "Your Current Location",
        }
      : null);

  const zoom = large ? 12 : 13;
  const resolvedHeight = height ?? (large ? 770 : 248);

  const mapSrc = primaryPoint
    ? `https://maps.google.com/maps?q=${primaryPoint.lat},${primaryPoint.lng}&z=${zoom}&output=embed`
    : null;

  const content = (
    <div
      className={cn(
        "relative block w-full overflow-hidden rounded-[24px] border border-[#E5E7EB] bg-[#F8FAFC] text-left shadow-[0px_1px_2px_rgba(16,24,40,0.04)] sm:rounded-[28px]",
        clickable && "cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
      )}
    >
      <div className="relative w-full" style={{ height: resolvedHeight }}>
        {mapSrc ? (
          <>
            <iframe
              title={primaryPoint?.label || "Transit Map"}
              src={mapSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.03)_0%,rgba(17,24,39,0)_35%,rgba(17,24,39,0.08)_100%)]" />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,#EEF4FF,transparent_55%),linear-gradient(180deg,#F8FAFC_0%,#F2F4F7_100%)] px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0px_2px_10px_rgba(16,24,40,0.08)]">
              <MapPinned className="h-6 w-6 text-[#667085]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#111827]">
                Map preview unavailable
              </p>
              <p className="mt-1 text-[13px] leading-5 text-[#667085]">
                {locationDenied
                  ? "Coordinates are not available and location access was denied."
                  : "Waiting for shipment coordinates or your current location."}
              </p>
            </div>
          </div>
        )}

        <div className="absolute right-3 top-3 z-10 inline-flex max-w-[calc(100%-24px)] items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-[#344054] shadow-[0px_4px_14px_rgba(16,24,40,0.08)] backdrop-blur-sm">
          <LocateFixed className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{primaryPoint?.label || "Location"}</span>
        </div>

        {clickable && !large ? (
          <div className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-semibold text-[#344054] shadow-[0px_4px_14px_rgba(16,24,40,0.08)] backdrop-blur-sm">
            <Expand className="h-3.5 w-3.5" />
            Expand Map
          </div>
        ) : null}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}