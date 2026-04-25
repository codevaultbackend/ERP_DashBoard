import { normalizeRole } from "./roles";

const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function removeCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export const saveAuthSession = (data: any) => {
  if (typeof window === "undefined") return;

  const user = data?.user || {};
  const token = data?.token || data?.accessToken || data?.access_token || "";

  const normalizedRole = normalizeRole(
    user?.normalized_role || user?.role || data?.role
  );

  const level = String(user?.organization_level || "")
    .trim()
    .toLowerCase();

  localStorage.setItem(
    "user",
    JSON.stringify({
      ...user,
      normalized_role: normalizedRole,
    })
  );

  localStorage.setItem("token", token);
  localStorage.setItem("role", normalizedRole);
  localStorage.setItem("normalized_role", normalizedRole);
  localStorage.setItem("level", level);

  sessionStorage.setItem("token", token);
  sessionStorage.setItem("role", normalizedRole);
  sessionStorage.setItem("normalized_role", normalizedRole);
  sessionStorage.setItem("level", level);

  setCookie("token", token);
  setCookie("role", normalizedRole);
};

export const getUserRole = () => {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("normalized_role") ||
    localStorage.getItem("role") ||
    sessionStorage.getItem("normalized_role") ||
    sessionStorage.getItem("role")
  );
};

export const setUserSession = (user: any) => {
  if (typeof window === "undefined") return;

  const normalizedRole = normalizeRole(user?.normalized_role || user?.role);

  const level = String(user?.organization_level || "")
    .trim()
    .toLowerCase();

  localStorage.setItem("role", normalizedRole);
  localStorage.setItem("normalized_role", normalizedRole);
  localStorage.setItem("level", level);

  sessionStorage.setItem("role", normalizedRole);
  sessionStorage.setItem("normalized_role", normalizedRole);
  sessionStorage.setItem("level", level);

  setCookie("role", normalizedRole);
};

export const clearAuthSession = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("normalized_role");
  localStorage.removeItem("level");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("normalized_role");
  sessionStorage.removeItem("level");

  removeCookie("token");
  removeCookie("role");
};