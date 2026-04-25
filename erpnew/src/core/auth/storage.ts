import { normalizeRole } from "./roles";

export const saveAuthSession = (data: any) => {
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

  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `role=${encodeURIComponent(role)}; path=/; max-age=86400; SameSite=Lax`;
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