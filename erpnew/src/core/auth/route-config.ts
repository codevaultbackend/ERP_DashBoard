import { ROLES } from "./roles";

export const ROLE_ROUTES = {
  [ROLES.SUPER_ADMIN]: [
    "/dashboard",
    "/state",
    "/district",
    "/retail",
  ],

  [ROLES.STATE_MANAGER]: [
    "/dashboard",
    "/district",
    "/retail",
  ],

  [ROLES.DISTRICT_MANAGER]: [
    "/dashboard",
    "/retail",
  ],
  [ROLES.retail_manager]: [
    "/dashboard",
  ],
};