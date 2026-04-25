export type RawUserRole =
  | "super_admin"
  | "head_office_tl"
  | "head_office_manager"
  | "head_manager"
  | "head_tl"
  | "state_manager"
  | "state_tl"
  | "district_manager"
  | "district_tl"
  | "retail_manager"
  | "retail_tl"
  | "manager"
  | "tl"
  | "admin";

export type AppRole = "head_office" | "state" | "district" | "retail";

export const ROLE_PREFIX: Record<AppRole, string> = {
  head_office: "/head-office",
  state: "/state",
  district: "/district",
  retail: "/retail",
};

export const ROLE_HOME: Record<AppRole, string> = {
  head_office: "/head-office/dashboard",
  state: "/state/dashboard",
  district: "/district/dashboard",
  retail: "/retail/dashboard",
};

export const ROLE_PROFILE: Record<AppRole, string> = {
  head_office: "/head-office/profile",
  state: "/state/profile",
  district: "/district/profile",
  retail: "/retail/profile",
};

function cleanRole(value?: string | null): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\r\n\t]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeRole(role?: string | null): string {
  const value = cleanRole(role);

  if (value === "superadmin") return "super_admin";
  if (value === "super_admin") return "super_admin";

  if (value === "headoffice") return "head_office";
  if (value === "head_office") return "head_office";

  if (value === "headofficemanager") return "head_manager";
  if (value === "head_office_manager") return "head_manager";
  if (value === "headmanager") return "head_manager";
  if (value === "head_manager") return "head_manager";
  if (value === "head_manager_admin") return "head_manager";

  if (value === "headofficetl") return "head_tl";
  if (value === "head_office_tl") return "head_tl";
  if (value === "headtl") return "head_tl";
  if (value === "head_tl") return "head_tl";

  if (value === "statemanager") return "state_manager";
  if (value === "state_manager") return "state_manager";
  if (value === "statetl") return "state_tl";
  if (value === "state_tl") return "state_tl";

  if (value === "districtmanager") return "district_manager";
  if (value === "district_manager") return "district_manager";
  if (value === "districttl") return "district_tl";
  if (value === "district_tl") return "district_tl";

  if (value === "retailmanager") return "retail_manager";
  if (value === "retail_manager") return "retail_manager";
  if (value === "retailtl") return "retail_tl";
  if (value === "retail_tl") return "retail_tl";

  if (value === "manager") return "retail_manager";
  if (value === "tl") return "retail_tl";
  if (value === "admin") return "super_admin";

  return value;
}

export function mapRoleToAppRole(role?: string | null): AppRole | null {
  const normalized = normalizeRole(role);

  if (normalized === "head_office") return "head_office";
  if (normalized === "state") return "state";
  if (normalized === "district") return "district";
  if (normalized === "retail") return "retail";

  if (
    normalized === "super_admin" ||
    normalized === "head_office_tl" ||
    normalized === "head_office_manager" ||
    normalized === "head_manager" ||
    normalized === "head_tl"
  ) {
    return "head_office";
  }

  if (normalized === "state_manager" || normalized === "state_tl") {
    return "state";
  }

  if (normalized === "district_manager" || normalized === "district_tl") {
    return "district";
  }

  if (normalized === "retail_manager" || normalized === "retail_tl") {
    return "retail";
  }

  return null;
}

export function getRoleHome(role?: string | null): string {
  const appRole = mapRoleToAppRole(role);
  return appRole ? ROLE_HOME[appRole] : "/login";
}

export function getRoleProfilePath(role?: string | null): string {
  const appRole = mapRoleToAppRole(role);
  return appRole ? ROLE_PROFILE[appRole] : "/login";
}

export function getRolePrefix(role?: string | null): string {
  const appRole = mapRoleToAppRole(role);
  return appRole ? ROLE_PREFIX[appRole] : "/";
}

export function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("imsToken") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
}

export function getStoredRole() {
  if (typeof window === "undefined") return "";

  return normalizeRole(
    localStorage.getItem("normalized_role") ||
      localStorage.getItem("role") ||
      sessionStorage.getItem("normalized_role") ||
      sessionStorage.getItem("role") ||
      ""
  );
}

export function getStoredAppRole(): AppRole | null {
  return mapRoleToAppRole(getStoredRole());
}