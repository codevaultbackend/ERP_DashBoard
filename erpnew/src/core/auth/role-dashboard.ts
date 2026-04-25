import { APP_ROUTE_GROUPS, mapRoleToRouteGroup } from "./roles";

export const ROLE_DASHBOARD = {
  [APP_ROUTE_GROUPS.HEAD_OFFICE]: "/head-office/dashboard",
  [APP_ROUTE_GROUPS.STATE]: "/state/dashboard",
  [APP_ROUTE_GROUPS.DISTRICT]: "/district/dashboard",
  [APP_ROUTE_GROUPS.RETAIL]: "/retail/dashboard",
} as const;

export function getRoleHomePath(role?: string | null) {
  const routeGroup = mapRoleToRouteGroup(role);

  if (!routeGroup) return "/login";

  return ROLE_DASHBOARD[routeGroup];
}