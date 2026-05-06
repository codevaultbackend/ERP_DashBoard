import type { ReportsApiData, ReportsUiData } from "./types";

const PIE_COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
];

const BAR_COLORS = [
  "#F59E0B",
  "#FBBF24",
  "#D1D5DB",
  "#9CA3AF",
  "#FB923C",
  "#FACC15",
];

export function safeNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const raw = String(value || "")
    .replace(/[₹,%\s]/g, "")
    .replace(/,/g, "")
    .trim();

  if (!raw) return 0;

  const multiplier = raw.toLowerCase().endsWith("cr")
    ? 10000000
    : raw.toLowerCase().endsWith("l")
      ? 100000
      : raw.toLowerCase().endsWith("k")
        ? 1000
        : 1;

  const cleaned = raw.replace(/cr|l|k/gi, "");
  const number = Number(cleaned);

  return Number.isFinite(number) ? number * multiplier : 0;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeNumber(value));
}

export function formatCurrencyCompact(value: number) {
  const safe = safeNumber(value);

  if (safe >= 10000000) return `₹${(safe / 10000000).toFixed(1)}Cr`;
  if (safe >= 100000) return `₹${(safe / 100000).toFixed(1)}L`;
  if (safe >= 1000) return `₹${Math.round(safe / 1000)}K`;

  return `₹${safe}`;
}

function cleanLabel(value: unknown, fallback = "Unknown") {
  const text = String(value || "").trim();
  return text && text !== "null" ? text : fallback;
}

function titleCase(value: unknown) {
  return cleanLabel(value)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function shortDate(value: unknown) {
  const text = cleanLabel(value, "-");

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return new Date(text).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  }

  return text;
}

export function normalizeReportsApiData(data: ReportsApiData): ReportsUiData {
  const cards = data?.cards || {};

  const categoryTotal = (data?.categorySales || []).reduce(
    (sum, item) => sum + safeNumber(item.value),
    0
  );

  return {
    summary: {
      totalRevenue: safeNumber(cards.totalRevenue),
      totalProfit: safeNumber(cards.totalProfit),
      totalInventory: safeNumber(cards.totalInventory),
      avgMonthlySales: safeNumber(cards.avgMonthlySales),
      growth: String(cards.growth || "0%"),
    },

    monthlyTrend: (data?.monthlyTrend || [])
      .filter((item) => item?.label)
      .map((item) => ({
        label: cleanLabel(item.label),
        sales: safeNumber(item.sales),
        profit: safeNumber(item.profit),
      })),

    categorySales: (data?.categorySales || []).map((item, index) => {
      const value = safeNumber(item.value);

      return {
        name: titleCase(item.label),
        value,
        percentage:
          categoryTotal > 0 ? Math.round((value / categoryTotal) * 100) : 0,
        color: PIE_COLORS[index % PIE_COLORS.length],
      };
    }),

    metalTypeDistribution: (data?.metalDistribution || []).map(
      (item, index) => ({
        name: cleanLabel(item.label),
        revenue: safeNumber(item.value),
        color: BAR_COLORS[index % BAR_COLORS.length],
      })
    ),

    dailyTrend: (data?.dailyTrend || []).map((item) => ({
      day: shortDate(item.label),
      sales: safeNumber(item.sales),
    })),

    inventoryAuditReport: (data?.inventoryAuditReport || []).map(
      (item, index) => ({
        id: item.id || index + 1,
        item: cleanLabel(item.item || item.name || item.product_name, "-"),
        code: cleanLabel(item.code, "-"),
        skuCode: cleanLabel(item.sku_code, "-"),
        category: titleCase(item.category),
        metalType: cleanLabel(item.metal_type, "-"),
        purity: cleanLabel(item.purity, "-"),
        netWt: cleanLabel(item.netWt, "0g"),
        stoneWt: cleanLabel(item.stoneWt, "0g"),
        grossWt: cleanLabel(item.grossWt, "0g"),
        checklist: Boolean(item.checklist),
        auditStatus: cleanLabel(item.audit_status, "pending"),
      })
    ),
  };
}