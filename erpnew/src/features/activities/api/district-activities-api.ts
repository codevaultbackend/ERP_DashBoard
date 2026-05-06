import axios from "axios";
import { normalizeRole } from "../../../core/auth/roles";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://erp-backend-w3pb.onrender.com";

export type ActivityLevel = "district" | "retail" | "head";

export type DistrictActivity = {
  id: number;
  source?: string;
  activity_type?: string;
  action?: string;
  module_name?: string;
  title?: string;
  description?: string;
  reference_id?: number;
  reference_no?: string;
  main_store?: string;
  store_name?: string;
  store_code?: string;
  handled_by?: string;
  icon?: string;
  color?: string;
  meta?: Record<string, any>;
  activity_at?: string;
  time_ago?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type RecentActivitiesResponse = {
  success: boolean;
  message: string;
  count: number;
  data: DistrictActivity[];
};

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function safeValue(value?: string | null) {
  if (!value) return null;
  if (value === "undefined" || value === "null") return null;
  return value;
}

function getStoredValue(keys: string[]) {
  if (typeof window === "undefined") return null;

  for (const key of keys) {
    const value = safeValue(
      localStorage.getItem(key) ||
        sessionStorage.getItem(key) ||
        getCookieValue(key)
    );

    if (value) return value;
  }

  return null;
}

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const rawUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getAuthToken() {
  const token = getStoredValue([
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "ims_token",
    "imsToken",
    "jwt",
  ]);

  if (token) return token;

  const user = getStoredUser();

  return safeValue(
    user?.token ||
      user?.accessToken ||
      user?.access_token ||
      user?.authToken ||
      user?.jwt
  );
}

function getAuthPayload() {
  const token = getAuthToken();
  if (!token) return null;

  return decodeJwtPayload(token);
}

function normalizeLevel(value?: string | null): ActivityLevel | null {
  const level = String(value || "").trim().toLowerCase();

  if (!level) return null;
  if (level.includes("head")) return "head";
  if (level.includes("retail")) return "retail";
  if (level.includes("district")) return "district";

  return null;
}

function getCurrentRole() {
  const payload = getAuthPayload();

  const role =
    payload?.role ||
    getStoredValue(["normalized_role", "role"]) ||
    getStoredUser()?.normalized_role ||
    getStoredUser()?.role ||
    "";

  return normalizeRole(role);
}

export function getActivityLevelByRole(): ActivityLevel {
  const payload = getAuthPayload();

  const payloadLevel = normalizeLevel(payload?.organization_level);
  if (payloadLevel) return payloadLevel;

  const storedLevel = normalizeLevel(
    getStoredValue(["level", "organization_level"])
  );
  if (storedLevel) return storedLevel;

  const userLevel = normalizeLevel(getStoredUser()?.organization_level);
  if (userLevel) return userLevel;

  const role = getCurrentRole();

  if (
    role === "super_admin" ||
    role === "head_manager" ||
    role === "head_tl" ||
    role === "head_office_manager" ||
    role === "head_office_tl"
  ) {
    return "head";
  }

  if (role === "retail_manager" || role === "retail_tl") {
    return "retail";
  }

  if (role === "district_manager" || role === "district_tl") {
    return "district";
  }

  return "head";
}

function getAuthHeaders() {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No login token found. Please login again.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getOwnRecentActivities(
  level?: ActivityLevel,
  limit = 500
) {
  const finalLevel = level || getActivityLevelByRole();

  const response = await axios.get<RecentActivitiesResponse>(
    `${API_BASE_URL}/Activity/${finalLevel}/own`,
    {
      params: { limit },
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

/**
 * Backward support.
 * Important: do NOT force district here, because common page may use this
 * while user is logged in as head/retail.
 */
export const getDistrictOwnRecentActivities = (limit = 500) =>
  getOwnRecentActivities(undefined, limit);

export const getRetailOwnRecentActivities = (limit = 500) =>
  getOwnRecentActivities("retail", limit);

export const getHeadOwnRecentActivities = (limit = 500) =>
  getOwnRecentActivities("head", limit);