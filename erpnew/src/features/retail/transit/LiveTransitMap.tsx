"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  MarkerF,
  PolylineF,
  useJsApiLoader,
} from "@react-google-maps/api";
import { MapPin, Navigation, Radio, RefreshCcw, Truck } from "lucide-react";
import { useTransferLiveTracking } from "./hooks/useTransferLiveTracking";

type Props = {
  transferId: string | number;
  height?: number | string;
  preview?: boolean;
};

type LatLng = {
  lat: number;
  lng: number;
};

const DEFAULT_CENTER = {
  lat: 28.6139,
  lng: 77.209,
};

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function formatTime(value?: string | Date | null) {
  if (!value) return "Not updated yet";

  try {
    return new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
    }).format(new Date(value));
  } catch {
    return "Not updated yet";
  }
}

export default function LiveTransitMap({
  transferId,
  height = 520,
  preview = false,
}: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const animationRef = useRef<number | null>(null);

  const [animatedPosition, setAnimatedPosition] = useState<LatLng | null>(null);

  const {
    current,
    destination,
    destinationAddress,
    center,
    status,
    isTrackingActive,
    isSocketConnected,
    isLoading,
    error,
    lastUpdatedAt,
    speed,
    heading,
    accuracy,
    refresh,
  } = useTransferLiveTracking(transferId, {
    enabled: true,
    pollMs: preview ? 12000 : 7000,
  });

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const routePath = useMemo(() => {
    const path: LatLng[] = [];

    if (animatedPosition) path.push(animatedPosition);
    else if (current) path.push(current);

    if (destination) path.push(destination);

    return path;
  }, [animatedPosition, current, destination]);

  useEffect(() => {
    if (!current) return;

    if (!animatedPosition) {
      setAnimatedPosition(current);
      return;
    }

    const from = animatedPosition;
    const to = current;

    if (
      from.lat.toFixed(6) === to.lat.toFixed(6) &&
      from.lng.toFixed(6) === to.lng.toFixed(6)
    ) {
      return;
    }

    const start = performance.now();
    const duration = 1200;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);

      const next = {
        lat: lerp(from.lat, to.lat, progress),
        lng: lerp(from.lng, to.lng, progress),
      };

      setAnimatedPosition(next);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [current]);

  useEffect(() => {
    if (!mapRef.current) return;

    const focus = animatedPosition || current || destination || DEFAULT_CENTER;
    mapRef.current.panTo(focus);
  }, [animatedPosition, current, destination]);

  const markerIcon = useMemo(() => {
    if (!isLoaded || typeof window === "undefined") return undefined;

    return {
      path: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16Zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5ZM5 11l1.5-4.5h11L19 11H5Z",
      fillColor: "#2563eb",
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: "#ffffff",
      scale: 1.4,
      rotation: Number(heading || 0),
      anchor: new google.maps.Point(12, 12),
    };
  }, [isLoaded, heading]);

  if (!apiKey) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-[24px] border border-red-100 bg-red-50 p-6 text-center text-sm font-medium text-red-600">
        Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center rounded-[24px] bg-slate-100 text-sm text-slate-500"
        style={{ height }}
      >
        Loading map...
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.10)]"
      style={{ height }}
    >
      {!preview && (
        <div className="absolute left-4 right-4 top-4 z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Truck size={18} className="text-blue-600" />
              Live Transit Tracking
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Radio
                  size={13}
                  className={
                    isSocketConnected ? "text-green-600" : "text-orange-500"
                  }
                />
                {isSocketConnected ? "Real-time connected" : "Polling active"}
              </span>

              <span>
                Status:{" "}
                <b className="capitalize text-slate-700">
                  {status || "Unknown"}
                </b>
              </span>

              <span>
                Tracking:{" "}
                <b
                  className={
                    isTrackingActive ? "text-green-600" : "text-red-500"
                  }
                >
                  {isTrackingActive ? "Active" : "Inactive"}
                </b>
              </span>
            </div>
          </div>

          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg transition hover:bg-slate-50"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
        </div>
      )}

      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "100%",
        }}
        center={center || DEFAULT_CENTER}
        zoom={current ? 15 : 11}
        onLoad={(map) => {
          mapRef.current = map;
        }}
        options={{
          disableDefaultUI: preview,
          zoomControl: !preview,
          streetViewControl: false,
          fullscreenControl: !preview,
          mapTypeControl: false,
          clickableIcons: false,
        }}
      >
        {routePath.length >= 2 && (
          <PolylineF
            path={routePath}
            options={{
              strokeColor: "#2563eb",
              strokeOpacity: 0.9,
              strokeWeight: 5,
              geodesic: true,
            }}
          />
        )}

        {animatedPosition && (
          <MarkerF
            position={animatedPosition}
            icon={markerIcon}
            title="Current vehicle location"
          />
        )}

        {destination && (
          <MarkerF
            position={destination}
            title={destinationAddress || "Destination"}
          />
        )}
      </GoogleMap>

      {!preview && (
        <div className="absolute bottom-4 left-4 right-4 z-10 grid gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur md:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Last Updated</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatTime(lastUpdatedAt)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">Speed</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {speed ? `${speed} km/h` : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">Accuracy</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {accuracy ? `${accuracy} m` : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">Destination</p>
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-slate-800">
              {destinationAddress || "Not available"}
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50 text-sm font-medium text-slate-600 backdrop-blur-sm">
          Fetching live location...
        </div>
      )}

      {error && !preview && (
        <div className="absolute left-4 top-24 z-20 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow">
          {error}
        </div>
      )}

      {!current && !isLoading && (
        <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-lg">
          <MapPin size={18} className="text-orange-500" />
          No live coordinate available yet
        </div>
      )}

      {preview && (
        <div className="absolute bottom-3 left-3 z-10 rounded-xl bg-white/95 px-3 py-2 text-xs font-semibold text-slate-700 shadow">
          <span className="inline-flex items-center gap-1">
            <Navigation size={13} className="text-blue-600" />
            Click to view live map
          </span>
        </div>
      )}
    </div>
  );
}