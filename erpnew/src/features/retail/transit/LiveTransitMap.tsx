"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DirectionsRenderer,
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

const DEFAULT_CENTER: LatLng = {
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

function isValidLatLng(point?: LatLng | null) {
  return (
    !!point &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

function isSamePoint(a?: LatLng | null, b?: LatLng | null) {
  if (!a || !b) return false;
  return (
    a.lat.toFixed(5) === b.lat.toFixed(5) &&
    a.lng.toFixed(5) === b.lng.toFixed(5)
  );
}

function getRouteKey(origin?: LatLng | null, destination?: LatLng | null) {
  if (!isValidLatLng(origin) || !isValidLatLng(destination)) return "";
  return `${origin!.lat.toFixed(5)},${origin!.lng.toFixed(
    5
  )}-${destination!.lat.toFixed(5)},${destination!.lng.toFixed(5)}`;
}

export default function LiveTransitMap({
  transferId,
  height = 520,
  preview = false,
}: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastRouteKeyRef = useRef("");

  const [animatedPosition, setAnimatedPosition] = useState<LatLng | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [directionsError, setDirectionsError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!current) return;

    if (!animatedPosition) {
      setAnimatedPosition(current);
      return;
    }

    if (isSamePoint(animatedPosition, current)) return;

    const from = animatedPosition;
    const to = current;
    const start = performance.now();
    const duration = 1200;

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);

      setAnimatedPosition({
        lat: lerp(from.lat, to.lat, progress),
        lng: lerp(from.lng, to.lng, progress),
      });

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
    if (!isLoaded) return;
    if (!isValidLatLng(current) || !isValidLatLng(destination)) return;

    const routeKey = getRouteKey(current, destination);
    if (!routeKey || lastRouteKeyRef.current === routeKey) return;

    lastRouteKeyRef.current = routeKey;

    const service = new google.maps.DirectionsService();

    service.route(
      {
        origin: current!,
        destination: destination!,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
        region: "IN",
      },
      (result, routeStatus) => {
        if (routeStatus === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
          setDirectionsError(null);

          if (mapRef.current && result.routes[0]?.bounds) {
            mapRef.current.fitBounds(result.routes[0].bounds);
          }
        } else {
          setDirections(null);
          setDirectionsError(`Road route unavailable: ${routeStatus}`);
          console.error("Directions failed:", {
            routeStatus,
            origin: current,
            destination,
          });
        }
      }
    );
  }, [isLoaded, current, destination]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (directions) return;

    const focus = animatedPosition || current || destination || DEFAULT_CENTER;
    mapRef.current.panTo(focus);
  }, [animatedPosition, current, destination, directions]);

  const markerIcon = useMemo(() => {
    if (!isLoaded || typeof window === "undefined") return undefined;

    return {
      url: "/icons/3d-car.png",
      scaledSize: new google.maps.Size(54, 54),
      anchor: new google.maps.Point(27, 27),
      rotation: Number(heading || 0),
    };
  }, [isLoaded, heading]);

  const fallbackPath = useMemo(() => {
    if (!isValidLatLng(current) || !isValidLatLng(destination)) return [];
    return [current!, destination!];
  }, [current, destination]);

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
        {directions ? (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              preserveViewport: true,
              polylineOptions: {
                strokeColor: "#2563eb",
                strokeOpacity: 0.9,
                strokeWeight: 5,
              },
            }}
          />
        ) : (
          fallbackPath.length === 2 && (
            <PolylineF
              path={fallbackPath}
              options={{
                strokeColor: "#2563eb",
                strokeOpacity: 0.55,
                strokeWeight: 4,
                geodesic: true,
                icons: [
                  {
                    icon: {
                      path: "M 0,-1 0,1",
                      strokeOpacity: 1,
                      scale: 3,
                    },
                    offset: "0",
                    repeat: "16px",
                  },
                ],
              }}
            />
          )
        )}

        {animatedPosition && (
          <MarkerF
            position={animatedPosition}
            title="Current vehicle location"
            icon={{
              url: "/Truck3d.png",
              scaledSize: new google.maps.Size(56, 56),
              anchor: new google.maps.Point(28, 28),
            }}
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

      {(error || directionsError) && !preview && (
        <div className="absolute left-4 top-24 z-20 rounded-xl bg-white/95 px-4 py-3 text-xs font-medium text-slate-600 shadow">
          {error || directionsError}
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