"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import {
  API_BASE,
  getTransferLiveLocation,
  type LiveDestination,
} from "../api";

type LatLng = {
  lat: number;
  lng: number;
};

type LiveTrackingState = {
  transferId: string | number;
  transferNo?: string;
  status?: string;
  isTrackingActive: boolean;
  current: LatLng | null;
  destination: LatLng | null;
  destinationAddress?: string | null;
  lastUpdatedAt?: string | Date | null;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
  batteryLevel?: number | null;
  isSocketConnected: boolean;
  isLoading: boolean;
  error: string | null;
};

type SocketPayload = {
  transfer_id: number;
  transfer_no?: string;
  status?: string;
  is_tracking_active?: boolean;
  current_location?: {
    latitude?: number | null;
    longitude?: number | null;
    recorded_at?: string | Date | null;
    speed?: number | null;
    heading?: number | null;
    accuracy?: number | null;
    battery_level?: number | null;
  };
  destination?: LiveDestination;
};

const DEFAULT_POLL_MS = 8000;

function isValidCoordinate(lat?: number | null, lng?: number | null) {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function samePoint(a: LatLng | null, b: LatLng | null) {
  if (!a || !b) return false;
  return a.lat.toFixed(6) === b.lat.toFixed(6) && a.lng.toFixed(6) === b.lng.toFixed(6);
}

export function useTransferLiveTracking(
  transferId?: string | number | null,
  options?: {
    enabled?: boolean;
    pollMs?: number;
  }
) {
  const enabled = options?.enabled ?? true;
  const pollMs = options?.pollMs ?? DEFAULT_POLL_MS;

  const socketRef = useRef<Socket | null>(null);
  const currentRef = useRef<LatLng | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<LiveTrackingState>({
    transferId: transferId || "",
    isTrackingActive: false,
    current: null,
    destination: null,
    isSocketConnected: false,
    isLoading: true,
    error: null,
  });

  const clearPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const applyPayload = useCallback((payload: SocketPayload) => {
    const loc = payload.current_location;
    const lat = Number(loc?.latitude);
    const lng = Number(loc?.longitude);

    const nextCurrent = isValidCoordinate(lat, lng)
      ? { lat, lng }
      : null;

    const destinationLat = Number(payload.destination?.latitude);
    const destinationLng = Number(payload.destination?.longitude);

    const nextDestination = isValidCoordinate(destinationLat, destinationLng)
      ? { lat: destinationLat, lng: destinationLng }
      : null;

    setState((prev) => {
      const shouldUpdateMarker =
        nextCurrent && !samePoint(prev.current, nextCurrent);

      const finalCurrent = shouldUpdateMarker
        ? nextCurrent
        : prev.current || nextCurrent;

      currentRef.current = finalCurrent;

      return {
        ...prev,
        transferNo: payload.transfer_no || prev.transferNo,
        status: payload.status || prev.status,
        isTrackingActive:
          typeof payload.is_tracking_active === "boolean"
            ? payload.is_tracking_active
            : prev.isTrackingActive,
        current: finalCurrent,
        destination: nextDestination || prev.destination,
        destinationAddress:
          payload.destination?.address ?? prev.destinationAddress,
        lastUpdatedAt:
          loc?.recorded_at || prev.lastUpdatedAt || new Date().toISOString(),
        speed: loc?.speed ?? prev.speed,
        heading: loc?.heading ?? prev.heading,
        accuracy: loc?.accuracy ?? prev.accuracy,
        batteryLevel: loc?.battery_level ?? prev.batteryLevel,
        isLoading: false,
        error: null,
      };
    });
  }, []);

  const fetchLatest = useCallback(async () => {
    if (!transferId) return;

    try {
      const res = await getTransferLiveLocation(transferId);

      const live = res.data.live_location;
      const dest = res.data.destination;

      applyPayload({
        transfer_id: res.data.transfer_id,
        transfer_no: res.data.transfer_no,
        status: res.data.status,
        is_tracking_active: res.data.is_tracking_active,
        current_location: {
          latitude: live.latitude,
          longitude: live.longitude,
          recorded_at: live.updated_at,
        },
        destination: dest,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error?.message || "Failed to fetch live location",
      }));
    }
  }, [transferId, applyPayload]);

  useEffect(() => {
    if (!transferId || !enabled) return;

    setState((prev) => ({
      ...prev,
      transferId,
      isLoading: true,
      error: null,
    }));

    fetchLatest();

    const socketUrl = API_BASE.replace(/\/$/, "");

    if (socketUrl) {
      const socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setState((prev) => ({
          ...prev,
          isSocketConnected: true,
        }));
      });

      socket.on("disconnect", () => {
        setState((prev) => ({
          ...prev,
          isSocketConnected: false,
        }));
      });

      socket.on(`transfer_tracking_${transferId}`, (payload: SocketPayload) => {
        applyPayload(payload);
      });
    }

    clearPolling();

    pollTimerRef.current = setInterval(() => {
      fetchLatest();
    }, pollMs);

    return () => {
      clearPolling();

      if (socketRef.current) {
        socketRef.current.off(`transfer_tracking_${transferId}`);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [transferId, enabled, pollMs, fetchLatest, applyPayload, clearPolling]);

  const center = useMemo(() => {
    return state.current || state.destination || null;
  }, [state.current, state.destination]);

  return {
    ...state,
    center,
    refresh: fetchLatest,
  };
}