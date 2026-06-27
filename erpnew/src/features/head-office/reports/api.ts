import type { ReportsApiResponse } from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-for-local.onrender.com";

function joinUrl(base: string, path: string) {
  const cleanBase = String(base || "").replace(/\/+$/, "");
  const cleanPath = String(path || "").replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

function normalizeToken(token: string) {
  return String(token || "")
    .trim()
    .replace(/^Bearer\s+/i, "");
}

function getAuthToken() {
  if (typeof window === "undefined") return "";

  const keys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "ims_token",
    "imsToken",
    "jwt",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) return normalizeToken(value);
  }

  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("authUser") ||
      localStorage.getItem("auth");

    if (raw) {
      const parsed = JSON.parse(raw);
      const token =
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.access_token ||
        parsed?.authToken ||
        parsed?.jwt;

      if (token) return normalizeToken(String(token));
    }
  } catch {
    // ignore invalid json
  }

  return "";
}

export async function fetchReportsAnalytics(): Promise<ReportsApiResponse> {
  const token = getAuthToken();

  const response = await fetch(joinUrl(API_BASE, "/dash/reports"), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Failed to fetch reports. Status ${response.status}`
    );
  }

  return data as ReportsApiResponse;
}