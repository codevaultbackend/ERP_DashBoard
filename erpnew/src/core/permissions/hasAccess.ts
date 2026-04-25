import { ROLE_ROUTES } from "../../core/auth/roles";

export function hasAccess(role: string, path: string) {
  return ROLE_ROUTES[role]?.includes(path);
}