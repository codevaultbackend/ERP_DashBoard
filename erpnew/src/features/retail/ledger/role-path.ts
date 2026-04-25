function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredRole() {
  if (typeof window === "undefined") return "";

  const explicitRole = localStorage.getItem("role");
  if (explicitRole) return explicitRole;

  const user = getStoredUser();

  return (
    user?.normalized_role ||
    user?.role ||
    user?.organization_level ||
    ""
  );
}

export function normalizeRole(role: string) {
  return String(role || "").trim().toLowerCase().replace(/_/g, "-");
}

export function isDistrictRole(role?: string) {
  const normalized = normalizeRole(role || getStoredRole());

  return (
    normalized === "district" ||
    normalized === "district-manager" ||
    normalized === "district-tl" ||
    normalized === "district-admin" ||
    normalized.startsWith("district")
  );
}

export function getLedgerBasePathByRole(role?: string) {
  return isDistrictRole(role) ? "/district/ledger" : "/retail/ledger";
}