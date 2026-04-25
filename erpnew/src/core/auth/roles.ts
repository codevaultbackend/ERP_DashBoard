export const RAW_ROLES = {
  SUPER_ADMIN: "super_admin",
  HEAD_OFFICE_MANAGER: "head_office_manager",
  HEAD_OFFICE_TL: "head_office_tl",
  HEAD_MANAGER: "head_manager",
  HEAD_TL: "head_tl",
  STATE_MANAGER: "state_manager",
  STATE_TL: "state_tl",
  DISTRICT_MANAGER: "district_manager",
  DISTRICT_TL: "district_tl",
  RETAIL_MANAGER: "retail_manager",
  RETAIL_TL: "retail_tl",
  MANAGER: "manager",
  TL: "tl",
  ADMIN: "admin",
} as const;

export type RawRole = (typeof RAW_ROLES)[keyof typeof RAW_ROLES];

export const APP_ROUTE_GROUPS = {
  HEAD_OFFICE: "head_office",
  STATE: "state",
  DISTRICT: "district",
  RETAIL: "retail",
} as const;

export type AppRouteGroup =
  (typeof APP_ROUTE_GROUPS)[keyof typeof APP_ROUTE_GROUPS];

function cleanRole(role?: string | null) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\r\n\t]+/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function normalizeRole(role?: string | null): RawRole | string {
  const value = cleanRole(role);

  if (!value) return "";

  if (value === "superadmin" || value === "super_admin") {
    return RAW_ROLES.SUPER_ADMIN;
  }

  if (
    value === "headofficemanager" ||
    value === "head_office_manager" ||
    value === "headmanager" ||
    value === "head_manager" ||
    value === "head_manager_admin"
  ) {
    return RAW_ROLES.HEAD_OFFICE_MANAGER;
  }

  if (
    value === "headofficetl" ||
    value === "head_office_tl" ||
    value === "headtl" ||
    value === "head_tl"
  ) {
    return RAW_ROLES.HEAD_OFFICE_TL;
  }

  if (value === "statemanager" || value === "state_manager") {
    return RAW_ROLES.STATE_MANAGER;
  }

  if (value === "statetl" || value === "state_tl") {
    return RAW_ROLES.STATE_TL;
  }

  if (value === "districtmanager" || value === "district_manager") {
    return RAW_ROLES.DISTRICT_MANAGER;
  }

  if (value === "districttl" || value === "district_tl") {
    return RAW_ROLES.DISTRICT_TL;
  }

  if (value === "retailmanager" || value === "retail_manager") {
    return RAW_ROLES.RETAIL_MANAGER;
  }

  if (value === "retailtl" || value === "retail_tl") {
    return RAW_ROLES.RETAIL_TL;
  }

  if (value === "manager") return RAW_ROLES.RETAIL_MANAGER;
  if (value === "tl") return RAW_ROLES.RETAIL_TL;
  if (value === "admin") return RAW_ROLES.SUPER_ADMIN;

  return value;
}

export function mapRoleToRouteGroup(
  role?: string | null
): AppRouteGroup | null {
  const normalized = normalizeRole(role);

  if (
    normalized === RAW_ROLES.SUPER_ADMIN ||
    normalized === RAW_ROLES.HEAD_OFFICE_MANAGER ||
    normalized === RAW_ROLES.HEAD_OFFICE_TL ||
    normalized === RAW_ROLES.HEAD_MANAGER ||
    normalized === RAW_ROLES.HEAD_TL
  ) {
    return APP_ROUTE_GROUPS.HEAD_OFFICE;
  }

  if (
    normalized === RAW_ROLES.STATE_MANAGER ||
    normalized === RAW_ROLES.STATE_TL
  ) {
    return APP_ROUTE_GROUPS.STATE;
  }

  if (
    normalized === RAW_ROLES.DISTRICT_MANAGER ||
    normalized === RAW_ROLES.DISTRICT_TL
  ) {
    return APP_ROUTE_GROUPS.DISTRICT;
  }

  if (
    normalized === RAW_ROLES.RETAIL_MANAGER ||
    normalized === RAW_ROLES.RETAIL_TL
  ) {
    return APP_ROUTE_GROUPS.RETAIL;
  }

  return null;
}