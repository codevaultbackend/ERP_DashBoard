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
    throw new Error(json?.message || "Request failed");
  }

  return json as T;
}

export async function getTransitTransfers(): Promise<{
  summary: TransitListResponse["summary"];
  data: TransitTransfer[];
}> {
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

  return { summary, data };
}

export async function getTransitById(id: string | number): Promise<TransitTransfer> {
  const res = await apiFetch<TransitDetailResponse>(`/request/transfers/${id}/details`);
  return normalizeTransitTransfer(res.data);
}

export async function markTransferReceived(transferId: string | number) {
  return apiFetch(`/request/transfers/${transferId}/receive`, {
    method: "PUT",
  });
}