import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-backend-w3pb.onrender.com";

const AUTH_KEYS = [
  "token",
  "accessToken",
  "access_token",
  "authToken",
  "ims_token",
  "imsToken",
  "jwt",
  "refreshToken",
  "refresh_token",
  "user",
  "authUser",
  "auth",
  "role",
  "normalized_role",
  "level",
  "organization_level",
  "organization_id",
  "store_code",
  "persist:root",
];

const APP_CACHE_KEY_MATCHERS = [
  "erp_",
  "profile",
  "report",
  "reports",
  "analytics",
  "dashboard",
  "cache",
];

const COOKIE_KEYS = [
  "token",
  "accessToken",
  "access_token",
  "authToken",
  "jwt",
  "refreshToken",
  "refresh_token",
  "role",
  "normalized_role",
  "user",
];

function isBrowser() {
  return typeof window !== "undefined";
}

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : "";
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;

  document.cookie = `${name}=; Max-Age=0; path=/`;
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
}

export function getAuthToken() {
  if (!isBrowser()) return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("jwt") ||
    getCookie("token") ||
    getCookie("accessToken") ||
    getCookie("access_token") ||
    getCookie("authToken") ||
    getCookie("jwt") ||
    ""
  );
}

export function clearAuthSession() {
  if (!isBrowser()) return;

  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  Object.keys(localStorage).forEach((key) => {
    const shouldRemove = APP_CACHE_KEY_MATCHERS.some((matcher) =>
      key.toLowerCase().includes(matcher)
    );

    if (shouldRemove) {
      localStorage.removeItem(key);
    }
  });

  Object.keys(sessionStorage).forEach((key) => {
    const shouldRemove = APP_CACHE_KEY_MATCHERS.some((matcher) =>
      key.toLowerCase().includes(matcher)
    );

    if (shouldRemove) {
      sessionStorage.removeItem(key);
    }
  });

  COOKIE_KEYS.forEach(clearCookie);
}

export function redirectToLogin() {
  if (!isBrowser()) return;

  const currentPath = window.location.pathname;

  if (currentPath !== "/login") {
    window.location.replace("/login");
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || "").toLowerCase();

    const isAuthError =
      status === 401 ||
      status === 403 ||
      message.includes("no token") ||
      message.includes("invalid token") ||
      message.includes("jwt expired") ||
      message.includes("session expired") ||
      message.includes("unauthorized");

    if (isAuthError) {
      clearAuthSession();
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);