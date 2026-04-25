import type {
  ReportsApiResponse,
  ReportsFilter,
  RetailReportsApiData,
  DistrictReportsApiData,
  UserRole,
} from "./types";

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

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeRole(role: string | null | undefined): UserRole {
  return String(role || "").trim().toLowerCase();
}

export function getReportsRole() {
  const user = getStoredUser();

  const rawRole =
    user?.role ||
    user?.normalized_role ||
    localStorage.getItem("role") ||
    "";

  const role = normalizeRole(rawRole);

  const organizationLevel = String(
    user?.organization_level || user?.level || ""
  ).toLowerCase();

  if (
    role.includes("district") ||
    organizationLevel === "district"
  ) {
    return "district";
  }

  return "retail";
}

function getReportsEndpoint(role: "district" | "retail") {
  // change only these 2 endpoints if your backend paths differ
  return role === "district"
    ? `${API_BASE}/District/report-analysis`
    : `${API_BASE}/dash/report`;
}

export async function fetchReportsAnalytics(filter: ReportsFilter = "daily") {
  const token = getAuthToken();
  const role = getReportsRole();

  const endpoint = getReportsEndpoint(role);
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set("filter", filter);

  const res = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json: ReportsApiResponse<DistrictReportsApiData | RetailReportsApiData> | null =
    await res.json().catch(() => null);

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