import { normalizeRole } from "./roles";

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

const APP_CACHE_KEY_MATCHERS = [
  "erp_",
  "profile",
  "report",
  "reports",
  "analytics",
  "dashboard",
  "cache",
];

function isBrowser() {
  return typeof window !== "undefined";
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;

  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
  const host = window.location.hostname;

  const parts = host.split(".");
  const rootDomain = parts.length >= 2 ? parts.slice(-2).join(".") : host;

  const domains = Array.from(
    new Set([undefined, host, `.${host}`, rootDomain, `.${rootDomain}`])
  );

  domains.forEach((domain) => {
    const domainPart = domain ? `; domain=${domain}` : "";

    document.cookie = `${name}=; expires=${expires}; max-age=0; path=/${domainPart}`;
    document.cookie = `${name}=; expires=${expires}; max-age=0; path=/${domainPart}; SameSite=Lax`;
    document.cookie = `${name}=; expires=${expires}; max-age=0; path=/${domainPart}; SameSite=None; Secure`;
  });
}

function clearMatchingStorage(storage: Storage) {
  const keys = Object.keys(storage);

  keys.forEach((key) => {
    const lowerKey = key.toLowerCase();

    const shouldRemove =
      AUTH_KEYS.includes(key) ||
      APP_CACHE_KEY_MATCHERS.some((matcher) =>
        lowerKey.includes(matcher.toLowerCase())
      );

    if (shouldRemove) {
      storage.removeItem(key);
    }
  });
}

export const getStoredToken = () => {
  if (!isBrowser()) return "";

  const tokenKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "ims_token",
    "imsToken",
    "jwt",
  ];

  for (const key of tokenKeys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return token;
  }

  return "";
};

export const clearAuthSession = () => {
  if (!isBrowser()) return;

  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  clearMatchingStorage(localStorage);
  clearMatchingStorage(sessionStorage);

  COOKIE_KEYS.forEach(clearCookie);

  try {
    const payload = {
      at: Date.now(),
      reason: "logout_or_switch_user",
    };

    localStorage.setItem("erp_logout_event_v1", JSON.stringify(payload));

    window.dispatchEvent(
      new CustomEvent("erp-auth-logout", {
        detail: payload,
      })
    );

    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("erp-auth");
      channel.postMessage(payload);
      channel.close();
    }
  } catch {
    // ignore
  }
};

export const saveAuthSession = (data: any) => {
  if (!isBrowser()) return;

  /**
   * IMPORTANT:
   * New user login se pehle previous user ka token/profile/report/dashboard cache clear.
   */
  clearAuthSession();

  const token = data?.token || data?.accessToken || "";
  const user = data?.user || {};

  const role = normalizeRole(user?.normalized_role || user?.role);

  localStorage.setItem(
    "user",
    JSON.stringify({
      ...user,
      normalized_role: role,
    })
  );

  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  localStorage.setItem("normalized_role", role);

  document.cookie = `token=${encodeURIComponent(
    token
  )}; path=/; max-age=86400; SameSite=Lax`;

  document.cookie = `role=${encodeURIComponent(
    role
  )}; path=/; max-age=86400; SameSite=Lax`;

  try {
    window.dispatchEvent(
      new CustomEvent("erp-auth-login", {
        detail: {
          user: {
            ...user,
            normalized_role: role,
          },
          role,
        },
      })
    );
  } catch {
    // ignore
  }
};

export const logoutAuthSession = () => {
  clearAuthSession();

  if (isBrowser()) {
    window.location.replace("/login");
  }
};

export const getRoleHomePath = (role: string) => {
  const routes: Record<string, string> = {
    super_admin: "/head-office/dashboard",
    head_office_manager: "/head-office/dashboard",
    head_office_tl: "/head-office/dashboard",

    state_manager: "/state/dashboard",
    state_tl: "/state/dashboard",

    district_manager: "/district/dashboard",
    district_tl: "/district/dashboard",

    retail_manager: "/retail/dashboard",
    retail_tl: "/retail/dashboard",
  };

  return routes[normalizeRole(role)] || "/login";
};