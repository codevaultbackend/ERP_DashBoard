import type {
  TransitDetailResponse,
  TransitListResponse,
  TransitTransfer,
} from "./types";
import {
  buildMergedSummary,
  normalizeTransitTransfer,
  sortTransfersByRecent,
} from "./utils";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ||
    ""
  );
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message || `API Error (${res.status})`);
  }

  return json as T;
}

export async function getTransitTransfers(): Promise<{
  summary: TransitListResponse["summary"];
  data: TransitTransfer[];
}> {
  try {
    const [incoming, outgoing] = await Promise.all([
      apiFetch<TransitListResponse>("/request/transfers/incoming"),
      apiFetch<TransitListResponse>("/request/transfers/outgoing"),
    ]);

    const merged = [
      ...(incoming?.data || []).map((item) => ({
        ...normalizeTransitTransfer(item),
        direction: "incoming" as const,
      })),
      ...(outgoing?.data || []).map((item) => ({
        ...normalizeTransitTransfer(item),
        direction: "outgoing" as const,
      })),
    ];

    const dedupedMap = new Map<number, TransitTransfer>();
    for (const item of merged) dedupedMap.set(item.id, item);

    const data = sortTransfersByRecent(Array.from(dedupedMap.values()));
    const summary = buildMergedSummary(data);

    return {
      summary,
      data,
    };
  } catch (err) {
    console.error("Transit API failed:", err);
    return {
      summary: {
        in_transit: 0,
        shipments: 0,
        goods_receipt: 0,
      },
      data: [],
    };
  }
}

export async function getTransitById(id: string | number) {
  const res = await apiFetch<TransitDetailResponse>(
    `/request/transfers/${id}/details`
  );

  return normalizeTransitTransfer(res.data);
}

export async function markTransferReceived(id: string | number) {
  return apiFetch(`/request/transfers/${id}/receive`, {
    method: "PUT",
  });
}

/* ================= LIVE TRACKING APIs ================= */

export type LiveCoordinate = {
  latitude: number | null;
  longitude: number | null;
  recorded_at?: string | Date | null;
  updated_at?: string | Date | null;
  speed?: number | null;
  heading?: number | null;
  accuracy?: number | null;
  battery_level?: number | null;
};

export type LiveDestination = {
  address?: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type TransferLiveLocationResponse = {
  success: boolean;
  data: {
    transfer_id: number;
    transfer_no: string;
    status: string;
    is_tracking_active: boolean;
    live_location: LiveCoordinate;
    destination: LiveDestination;
  };
};

export type TransferRouteResponse = {
  success: boolean;
  data?: any;
};

export async function getTransferLiveLocation(id: string | number) {
  return apiFetch<TransferLiveLocationResponse>(
    `/track/${id}/live-location`
  );
}

export async function getTransferRoute(id: string | number) {
  return apiFetch<TransferRouteResponse>(`/track/${id}/route`);
}

export async function startTransferLiveTracking(
  id: string | number,
  payload: {
    start_lat: number;
    start_lng: number;
  }
) {
  return apiFetch(`/track/${id}/start`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTransferLiveLocation(
  id: string | number,
  payload: {
    latitude: number;
    longitude: number;
    speed?: number | null;
    heading?: number | null;
    accuracy?: number | null;
    battery_level?: number | null;
  }
) {
  return apiFetch(`/track/${id}/location`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function stopTransferLiveTracking(id: string | number) {
  return apiFetch(`/track/${id}/stop`, {
    method: "POST",
  });
}

export { API_BASE };