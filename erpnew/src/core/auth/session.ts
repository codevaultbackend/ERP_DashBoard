import { normalizeRole } from "./roles";

export const saveAuthSession = (data: any) => {
  const normalizedRole = normalizeRole(
    data?.user?.normalized_role || data?.user?.role
  );

  const token = data?.token || data?.accessToken || "";

  localStorage.setItem(
    "user",
    JSON.stringify({
      ...data.user,
      normalized_role: normalizedRole,
    })
  );

  localStorage.setItem("token", token);
  localStorage.setItem("role", normalizedRole);
  localStorage.setItem("normalized_role", normalizedRole);
  localStorage.setItem(
    "level",
    String(data?.user?.organization_level || "").trim().toLowerCase()
  );

  sessionStorage.setItem("token", token);
  sessionStorage.setItem("role", normalizedRole);
  sessionStorage.setItem("normalized_role", normalizedRole);
  sessionStorage.setItem(
    "level",
    String(data?.user?.organization_level || "").trim().toLowerCase()
  );

  document.cookie = `token=${token}; path=/; SameSite=Lax`;
  document.cookie = `role=${normalizedRole}; path=/; SameSite=Lax`;
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
  const normalizedRole = normalizeRole(user?.normalized_role || user?.role);

  localStorage.setItem("role", normalizedRole);
  localStorage.setItem("normalized_role", normalizedRole);
  localStorage.setItem(
    "level",
    String(user?.organization_level || "").trim().toLowerCase()
  );

  sessionStorage.setItem("role", normalizedRole);
  sessionStorage.setItem("normalized_role", normalizedRole);
  sessionStorage.setItem(
    "level",
    String(user?.organization_level || "").trim().toLowerCase()
  );
};

export const clearAuthSession = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("normalized_role");
  localStorage.removeItem("level");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("normalized_role");
  sessionStorage.removeItem("level");

  document.cookie = "token=; path=/; Max-Age=0";
  document.cookie = "role=; path=/; Max-Age=0";
};