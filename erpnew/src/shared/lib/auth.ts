export type AppRole = "head_office" | "state" | "district" | "retail";

export const ROLE_HOME: Record<AppRole, string> = {
  head_office: "/head-office/dashboard",
  state: "/state/dashboard",
  district: "/district/dashboard",
  retail: "/retail/dashboard",
};

export const ROLE_ACCESS: Record<AppRole, string[]> = {
  head_office: ["/head-office"],
  state: ["/state"],
  district: ["/district"],
  retail: ["/retail"],
};

export function normalizeRole(role?: string | null): AppRole | null {
  const value = String(role || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  if (
    value === "head_office" ||
    value === "state" ||
    value === "district" ||
    value === "retail"
  ) {
    return value;
  }

  return null;
}

export function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    getCookie("token")
  );
}

export function getStoredRole(): AppRole | null {
  if (typeof window === "undefined") return null;

  const role =
    localStorage.getItem("role") ||
    sessionStorage.getItem("role") ||
    getCookie("role");

  return normalizeRole(role);
}

export function isAuthenticated() {
  return Boolean(getStoredToken());
}

export function canAccessPath(role: AppRole | null, pathname: string) {
  if (!role) return false;

  const allowedPrefixes = ROLE_ACCESS[role] || [];
  return allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
}