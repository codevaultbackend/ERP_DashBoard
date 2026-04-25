import type {
  DistrictReportsApiData,
  ReportsUiData,
  RetailReportsApiData,
} from "./types";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCurrencyCompact(value: number) {
  const safe = Number.isFinite(value) ? value : 0;

  if (safe >= 10000000) return `₹${(safe / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  if (safe >= 100000) return `₹${(safe / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  if (safe >= 1000) return `₹${Math.round(safe / 1000)}K`;
  return `₹${safe}`;
}

export function normalizeCategoryName(value: string) {
  const raw = String(value || "").trim();
  if (!raw) return "Unknown";

  const key = raw.toLowerCase().replace(/\s+/g, " ");

  if (
    key === "nose pin" ||
    key === "nosepin" ||
    key === "nose-pin" ||
    key === "no se pin" ||
    key === "nose  pin" ||
    key === "nose pin "
  ) {
    return "Nose Pin";
  }

  return raw
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const PIE_COLORS = [
  "#8B5CF6",
  "#6366F1",
  "#14B8A6",
  "#EC4899",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
];

const BAR_COLORS = [
  "#F59E0B",
  "#FBBF24",
  "#D1D5DB",
  "#9CA3AF",
  "#FB923C",
  "#FACC15",
  "#CBD5E1",
  "#94A3B8",
];

const CATEGORY_TAGS = [
  "bg-[#E9D5FF] text-[#7C3AED]",
  "bg-[#DBEAFE] text-[#2563EB]",
  "bg-[#DCFCE7] text-[#15803D]",
  "bg-[#FEF3C7] text-[#B45309]",
  "bg-[#FCE7F3] text-[#BE185D]",
];

export function getRankColor(rank: number) {
  if (rank === 1) return "bg-[#E1A200]";
  if (rank === 2) return "bg-[#9CA3AF]";
  if (rank === 3) return "bg-[#F97316]";
  return "bg-[#3B82F6]";
}

export function getCategoryTagClassName(category: string) {
  const normalized = normalizeCategoryName(category);
  const index =
    normalized.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0) %
    CATEGORY_TAGS.length;

  return CATEGORY_TAGS[index];
}

function safeNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDistrictResponse(data: DistrictReportsApiData): ReportsUiData {
  const categoryRevenueTotal = (data.category_wise_sales || []).reduce(
    (sum, item) => sum + safeNumber(item.revenue),
    0
  );

  return {
    summary: {
      totalCashReceived: safeNumber(data.summary?.total_cash_received),
      accountTransfer: safeNumber(data.summary?.account_transfer),
      totalSales: safeNumber(data.summary?.total_sales),
    },
    cashVsAccount: (data.cash_vs_account_reconciliation || []).map((item) => ({
      label: item.label || "-",
      cash: safeNumber(item.cash_received),
      account: safeNumber(item.account_transfer),
      total: safeNumber(item.total_sales),
    })),
    categorySales: (data.category_wise_sales || []).map((item, index) => ({
      name: normalizeCategoryName(item.category),
      value: safeNumber(item.revenue),
      percentage:
        categoryRevenueTotal > 0
          ? Math.round((safeNumber(item.revenue) / categoryRevenueTotal) * 100)
          : 0,
      color: PIE_COLORS[index % PIE_COLORS.length],
    })),
    metalTypeDistribution: (data.metal_type_distribution || []).map((item, index) => ({
      name: item.metal_type || "Unknown",
      revenue: safeNumber(item.revenue),
      color: BAR_COLORS[index % BAR_COLORS.length],
    })),
    topProducts: (data.top_performing_products || []).map((item) => ({
      rank: safeNumber(item.rank),
      name: item.product_name || "-",
      category: normalizeCategoryName(item.category),
      unitsSold: safeNumber(item.units_sold),
      totalRevenue: formatCurrency(safeNumber(item.total_revenue)),
      performance: Math.max(0, Math.min(100, safeNumber(item.performance))),
      rankColor: getRankColor(safeNumber(item.rank)),
      tagClassName: getCategoryTagClassName(item.category),
    })),
  };
}

function normalizeRetailResponse(data: RetailReportsApiData): ReportsUiData {
  const summary = data.summary || data.dashboardSummary || {};

  const cashRows = data.cash_vs_account_reconciliation || data.cashVsAccount || [];
  const categoryRows = data.category_wise_sales || data.categorySales || [];
  const metalRows = data.metal_type_distribution || data.typeDistribution || [];
  const topRows = data.top_performing_products || data.topProducts || [];

  const categoryRevenueTotal = categoryRows.reduce(
    (sum, item: any) => sum + safeNumber(item.revenue),
    0
  );

  return {
    summary: {
      totalCashReceived: safeNumber(
        (summary as any).total_cash_received ?? (summary as any).totalCashReceived
      ),
      accountTransfer: safeNumber(
        (summary as any).account_transfer ?? (summary as any).accountTransfer
      ),
      totalSales: safeNumber(
        (summary as any).total_sales ?? (summary as any).totalSales
      ),
    },
    cashVsAccount: cashRows.map((item: any) => ({
      label: item.label || item.day || "-",
      cash: safeNumber(item.cash_received ?? item.cash),
      account: safeNumber(item.account_transfer ?? item.online),
      total: safeNumber(item.total_sales ?? item.total),
    })),
    categorySales: categoryRows.map((item: any, index: number) => ({
      name: normalizeCategoryName(item.category),
      value: safeNumber(item.revenue),
      percentage:
        categoryRevenueTotal > 0
          ? Math.round((safeNumber(item.revenue) / categoryRevenueTotal) * 100)
          : 0,
      color: PIE_COLORS[index % PIE_COLORS.length],
    })),
    metalTypeDistribution: metalRows.map((item: any, index: number) => ({
      name: item.metal_type || item.label || "Unknown",
      revenue: safeNumber(item.revenue ?? item.value),
      color: BAR_COLORS[index % BAR_COLORS.length],
    })),
    topProducts: topRows.map((item: any) => ({
      rank: safeNumber(item.rank),
      name: item.product_name || "-",
      category: normalizeCategoryName(item.category),
      unitsSold: safeNumber(item.units_sold),
      totalRevenue: formatCurrency(safeNumber(item.total_revenue)),
      performance: Math.max(0, Math.min(100, safeNumber(item.performance))),
      rankColor: getRankColor(safeNumber(item.rank)),
      tagClassName: getCategoryTagClassName(item.category),
    })),
  };
}

export function normalizeReportsApiData(
  role: "district" | "retail",
  data: DistrictReportsApiData | RetailReportsApiData
): ReportsUiData {
  return role === "district"
    ? normalizeDistrictResponse(data as DistrictReportsApiData)
    : normalizeRetailResponse(data as RetailReportsApiData);
}