import type { ReportsApiData, ReportsApiResponse } from "./types";
import { getAuthToken } from "./utils";

const REPORTS_API_URL =
  process.env.NEXT_PUBLIC_REPORTS_API_URL ||
  "https://erp-backend-w3pb.onrender.com/dash/report";

export async function fetchReportsAnalytics(): Promise<ReportsApiData> {
  const token = getAuthToken();

  const response = await fetch(REPORTS_API_URL, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const json: ReportsApiResponse | null = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(json?.message || "Failed to fetch reports");
  }

  return {
    dashboardSummary: json.data?.dashboardSummary || {},
    cashVsAccount: Array.isArray(json.data?.cashVsAccount)
      ? json.data.cashVsAccount
      : [],
    categorySales: Array.isArray(json.data?.categorySales)
      ? json.data.categorySales
      : [],
    typeDistribution: Array.isArray(json.data?.typeDistribution)
      ? json.data.typeDistribution
      : [],
    topProducts: Array.isArray(json.data?.topProducts)
      ? json.data.topProducts
      : [],
  };
}