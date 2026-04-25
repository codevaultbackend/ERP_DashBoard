import { APP_ROUTE_GROUPS, RAW_ROLES } from "./roles";

const HEAD_OFFICE_ROUTES = [
  "/head-office",
  "/head-office/dashboard",
  "/head-office/profile",
  "/head-office/store-management",
];

const STATE_ROUTES = [
  "/state",
  "/state/dashboard",
  "/state/profile",
];

const DISTRICT_ROUTES = [
  "/district",
  "/district/dashboard",
  "/district/profile",
];

const RETAIL_ROUTES = [
  "/retail",
  "/retail/dashboard",
  "/retail/profile",
  "/retail/stock-management",
  "/retail/request",
  "/retail/transit",
  "/retail/billing",
  "/retail/ledger",
  "/retail/refund-return",
  "/retail/reports-analytics",
  "/retail/exchange",
];

export const ROLE_ROUTES = {
  [RAW_ROLES.SUPER_ADMIN]: HEAD_OFFICE_ROUTES,
  [RAW_ROLES.HEAD_OFFICE_MANAGER]: HEAD_OFFICE_ROUTES,
  [RAW_ROLES.HEAD_OFFICE_TL]: HEAD_OFFICE_ROUTES,
  [RAW_ROLES.HEAD_MANAGER]: HEAD_OFFICE_ROUTES,
  [RAW_ROLES.HEAD_TL]: HEAD_OFFICE_ROUTES,

  [RAW_ROLES.STATE_MANAGER]: STATE_ROUTES,
  [RAW_ROLES.STATE_TL]: STATE_ROUTES,

  [RAW_ROLES.DISTRICT_MANAGER]: DISTRICT_ROUTES,
  [RAW_ROLES.DISTRICT_TL]: DISTRICT_ROUTES,

  [RAW_ROLES.RETAIL_MANAGER]: RETAIL_ROUTES,
  [RAW_ROLES.RETAIL_TL]: RETAIL_ROUTES,
} as const;

export const ROUTE_GROUP_PREFIX = {
  [APP_ROUTE_GROUPS.HEAD_OFFICE]: "/head-office",
  [APP_ROUTE_GROUPS.STATE]: "/state",
  [APP_ROUTE_GROUPS.DISTRICT]: "/district",
  [APP_ROUTE_GROUPS.RETAIL]: "/retail",
} as const;