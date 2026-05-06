import type {
  ReportsApiResponse,
  ReportsFilter,
  RetailReportsApiData,
  DistrictReportsApiData,
  UserRole,
} from "./types";

import { getAuthToken } from "./lib/apiClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-backend-w3pb.onrender.com";

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("authUser") ||
      sessionStorage.getItem("user") ||
      sessionStorage.getItem("authUser");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeRole(role: string | null | undefined): UserRole {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_") as UserRole;
}

export function getReportsRole(): "head" | "district" | "retail" {
  const user = getStoredUser();

  const rawRole =
    user?.role ||
    user?.normalized_role ||
    localStorage.getItem("role") ||
    localStorage.getItem("normalized_role") ||
    sessionStorage.getItem("role") ||
    sessionStorage.getItem("normalized_role") ||
    "";

  const role = normalizeRole(rawRole);

  const organizationLevel = String(
    user?.organization_level ||
      user?.level ||
      localStorage.getItem("organization_level") ||
      localStorage.getItem("level") ||
      sessionStorage.getItem("organization_level") ||
      sessionStorage.getItem("level") ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    role === "super_admin" ||
    role === "admin" ||
    role === "head" ||
    role === "head_office" ||
    role.includes("super_admin") ||
    role.includes("head") ||
    organizationLevel === "head" ||
    organizationLevel === "head_office"
  ) {
    return "head";
  }

  if (role.includes("district") || organizationLevel === "district") {
    return "district";
  }

  return "retail";
}

function getReportsEndpoint(role: "head" | "district" | "retail") {
  if (role === "district") {
    return `${API_BASE}/dash/report`;
  }

  return `${API_BASE}/dash/report`;
}

export async function fetchReportsAnalytics(filter: ReportsFilter = "daily") {
  const token = getAuthToken();
  const role = getReportsRole();

  const endpoint = getReportsEndpoint(role);
  const url = new URL(endpoint);

  url.searchParams.set("filter", filter);
  url.searchParams.set("range", filter);

  const res = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json:
    | ReportsApiResponse<DistrictReportsApiData | RetailReportsApiData>
    | null = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json?.message || "Failed to fetch reports analytics");
  }

  if (!json?.success || !json?.data) {
    throw new Error(json?.message || "Invalid reports analytics response");
  }

  return {
    role,
    data: json.data,
  };
}