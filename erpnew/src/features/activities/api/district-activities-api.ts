import axios from "axios";
import { normalizeRole } from "../../../core/auth/roles";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://erp-for-local.onrender.com";

/* =======================
   TYPES
======================= */

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

/* =======================
   STORAGE HELPERS
======================= */

function getCookieValue(name: string) {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  );

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
    const raw =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/* =======================
   AUTH
======================= */

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");

    const json = decodeURIComponent(
      atob(normalized)
        .split("")
        .map(
          (c) =>
            `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`
        )
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
    "jwt",
  ]);

  if (token) return token;

  const user = getStoredUser();

  return safeValue(
    user?.token ||
    user?.accessToken ||
    user?.authToken ||
    user?.jwt
  );
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

/* =======================
   ROLE DETECTION
======================= */

function normalizeLevel(value?: string | null) {
  const v = String(value || "").toLowerCase();

  if (!v) return null;
  if (v.includes("head")) return "head";
  if (v.includes("retail")) return "retail";
  if (v.includes("district")) return "district";

  return null;
}

function getCurrentRole() {
  const payload = decodeJwtPayload(getAuthToken() || "");

  const role =
    payload?.role ||
    getStoredValue(["role", "normalized_role"]) ||
    getStoredUser()?.role ||
    "";

  return normalizeRole(role);
}

function getActivityLevelByRole() {
  const payload = decodeJwtPayload(getAuthToken() || "");

  const payloadLevel = normalizeLevel(payload?.organization_level);
  if (payloadLevel) return payloadLevel;

  const storedLevel = normalizeLevel(
    getStoredValue(["level", "organization_level"])
  );
  if (storedLevel) return storedLevel;

  const userLevel = normalizeLevel(
    getStoredUser()?.organization_level
  );
  if (userLevel) return userLevel;

  const role = getCurrentRole();

  if (
    role === "super_admin" ||
    role === "head_manager" ||
    role === "head_tl" ||
    role === "head_office_manager" ||
    role === "head_office_tl"
  ) return "head";

  if (role === "retail_manager" || role === "retail_tl")
    return "retail";

  if (role === "district_manager" || role === "district_tl")
    return "district";

  return "head";
}

/* =======================
   API: OWN ACTIVITY (NEW)
   uses: /Activity
======================= */

export async function getOwnRecentActivities(
  page = 1,
  limit = 20,
  search = ""
) {
  const response = await axios.get<RecentActivitiesResponse>(
    `${API_BASE_URL}/Activity/head/own`,
    {
      params: {
        page,
        limit,
        search,
      },
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

/* =======================
   API: STORE WISE (HEAD ONLY)
   uses: /Activity/store-wise
======================= */

export async function getStoreWiseActivities(
  storeCode: string,
  page = 1,
  limit = 20,
  search = ""
) {
  const response = await axios.get<RecentActivitiesResponse>(
    `${API_BASE_URL}/Activity/store-wise`,
    {
      params: {
        store_code: storeCode,
        page,
        limit,
        search,
      },
      headers: getAuthHeaders(),
    }
  );

  return response.data;
}

/* =======================
   BACKWARD SUPPORT (OPTIONAL WRAPPERS)
======================= */

export const getDistrictOwnRecentActivities = (limit = 500) =>
  getOwnRecentActivities(1, limit);
export function getCurrentOrganizationLevel() {
  return getActivityLevelByRole();
}
export function getLoggedInRole() {
  return getCurrentRole();
}

export const getRetailOwnRecentActivities = (limit = 500) =>
  getOwnRecentActivities(1, limit);

export const getHeadOwnRecentActivities = (limit = 500) =>
  getOwnRecentActivities(1, limit);