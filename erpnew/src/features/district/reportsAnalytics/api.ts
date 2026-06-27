import type {
  DistrictReportApiResponse,
  DistrictReportQuery,
  DistrictReportsData,
} from "./types";
import { safePercent, toNumber } from "./utils";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-for-local.onrender.com";

const DISTRICT_REPORT_PATH =
  process.env.NEXT_PUBLIC_DISTRICT_REPORT_PATH || "/dash/report";

function joinUrl(base: string, path: string) {
  const cleanBase = String(base || "").replace(/\/+$/, "");
  const cleanPath = String(path || "").replace(/^\/+/, "");
  return `${cleanBase}/${cleanPath}`;
}

function getAuthToken() {
  if (typeof window === "undefined") return "";

  const keys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "ims_token",
    "imsToken",
  ];

  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) return value.replace(/^Bearer\s+/i, "").trim();
  }

  try {
    const rawUser = window.localStorage.getItem("user");
    if (!rawUser) return "";

    const parsed = JSON.parse(rawUser);

    const token =
      parsed?.token ||
      parsed?.accessToken ||
      parsed?.access_token ||
      parsed?.authToken;

    return token ? String(token).replace(/^Bearer\s+/i, "").trim() : "";
  } catch {
    return "";
  }
}

function normalizeReportsResponse(
  payload: DistrictReportApiResponse
): DistrictReportsData {
  const data = payload?.data || {};
  const summary = data.dashboardSummary || {};

  return {
    summary: {
      totalCustomers: toNumber(summary.totalCustomers),
      totalRevenue: toNumber(summary.totalRevenue),
      totalSales: toNumber(summary.totalSales),
      totalCashReceived: toNumber(summary.totalCashReceived),
      accountTransfer: toNumber(summary.accountTransfer),
    },

    cashVsAccount: Array.isArray(data.cashVsAccount)
      ? data.cashVsAccount.map((row) => ({
          date: String(row.date || ""),
          day: String(row.day || ""),
          cash: toNumber(row.cash),
          pending: toNumber(row.pending),
          total: toNumber(row.total),
        }))
      : [],

    categorySales: Array.isArray(data.categorySales)
      ? data.categorySales.map((row) => ({
          category: String(row.category || "Others"),
          revenue: toNumber(row.revenue),
          percentage: safePercent(row.percentage),
        }))
      : [],

    typeDistribution: Array.isArray(data.typeDistribution)
      ? data.typeDistribution.map((row) => ({
          name: String(row.metal_type || row.type || row.name || "Unknown Type"),
          revenue: toNumber(row.revenue ?? row.total_revenue ?? row.value),
        }))
      : [],

    topProducts: Array.isArray(data.topProducts)
      ? data.topProducts.map((row, index) => ({
          rank: toNumber(row.rank, index + 1),
          product_name: String(row.product_name || "Unnamed Product"),
          category: String(row.category || "Others"),
          units_sold: toNumber(row.units_sold),
          total_revenue: toNumber(row.total_revenue),
          performance: safePercent(row.performance),
        }))
      : [],
  };
}

export async function getDistrictReportsAnalytics(
  query?: DistrictReportQuery
): Promise<DistrictReportsData> {
  const token = getAuthToken();

  const url = new URL(joinUrl(API_BASE, DISTRICT_REPORT_PATH));

  if (query?.period) url.searchParams.set("period", query.period);
  if (query?.from_date) url.searchParams.set("from_date", query.from_date);
  if (query?.to_date) url.searchParams.set("to_date", query.to_date);
  if (query?.store_code) url.searchParams.set("store_code", query.store_code);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  });

  let payload: DistrictReportApiResponse | null = null;

  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok || !payload?.success) {
    throw new Error(
      payload?.message || `Failed to fetch reports. Status: ${res.status}`
    );
  }

  return normalizeReportsResponse(payload);
}