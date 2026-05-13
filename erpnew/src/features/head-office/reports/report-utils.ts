import type { ChartRow, ReportCards, ReportSeriesRow } from "./types";

export const DEFAULT_CARDS: Required<ReportCards> = {
  totalRevenue: "₹0",
  totalProfit: "₹0",
  totalInventory: 0,
  avgMonthlySales: "₹0",
  growth: "0%",
};

export const ERP_CHART = {
  primary: "var(--color-erp-primary)",
  primaryHover: "var(--color-erp-primary-hover)",
  primarySoft: "var(--color-erp-primary-soft)",

  success: "var(--color-erp-success)",
  successSoft: "var(--color-erp-success-soft)",

  purple: "var(--color-erp-purple)",
  purpleSoft: "var(--color-erp-purple-soft)",

  yellow: "var(--color-erp-yellow)",
  yellowSoft: "var(--color-erp-yellow-soft)",

  warning: "var(--color-erp-warning)",
  warningSoft: "var(--color-erp-warning-soft)",

  heading: "var(--color-erp-heading)",
  muted: "var(--color-erp-muted)",
  textSoft: "var(--color-erp-text-soft)",
  border: "var(--color-erp-border)",
  borderSoft: "var(--color-erp-border-soft)",
  card: "var(--color-erp-card)",
};

export const PIE_COLORS = [
  "var(--color-erp-primary)",
  "var(--color-erp-purple)",
  "var(--color-erp-success)",
  "var(--color-erp-yellow)",
  "var(--color-erp-danger)",
  "#14B8A6",
  "var(--color-erp-muted)",
];

export const METAL_COLORS = [
  "#F59E0B",
  "#FBBF24",
  "#D1D5DB",
  "#9CA3AF",
  "var(--color-erp-muted)",
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const MONTH_LOOKUP: Record<string, number> = MONTHS.reduce(
  (acc, month, index) => {
    acc[month.toLowerCase()] = index;
    return acc;
  },
  {} as Record<string, number>
);

export function parseAmount(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const raw = String(value).trim();
  const upper = raw.toUpperCase();

  const numeric = Number(raw.replace(/[₹,\s%]/g, "").replace(/[A-Z]/g, ""));

  if (!Number.isFinite(numeric)) return 0;

  if (upper.includes("CR")) return numeric * 10000000;
  if (upper.includes("L")) return numeric * 100000;
  if (upper.includes("K")) return numeric * 1000;

  return numeric;
}

export function formatCurrency(value: unknown) {
  const amount = parseAmount(value);

  if (!Number.isFinite(amount)) return "₹0";

  if (Math.abs(amount) >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }

  if (Math.abs(amount) >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }

  if (Math.abs(amount) >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }

  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPlainNumber(value: unknown) {
  const amount = parseAmount(value);

  return amount.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
}

export function shortLabel(label: string | null | undefined, fallback: string) {
  if (!label) return fallback;

  const value = String(label).trim();

  const parsedDate = new Date(value);

  if (!Number.isNaN(parsedDate.getTime()) && value.includes("-")) {
    return String(parsedDate.getDate());
  }

  return value;
}

function normalizeMonthLabel(label: string | null | undefined) {
  if (!label) return "";

  const value = String(label).trim();

  if (!value) return "";

  const monthCandidate = value.slice(0, 3).toLowerCase();

  if (monthCandidate in MONTH_LOOKUP) {
    return MONTHS[MONTH_LOOKUP[monthCandidate]];
  }

  const parsedDate = new Date(value);

  if (!Number.isNaN(parsedDate.getTime())) {
    return MONTHS[parsedDate.getMonth()];
  }

  return value;
}

function getNextMonthFromPrevious(previousMonth: string | null) {
  if (!previousMonth) return "";

  const index = MONTH_LOOKUP[previousMonth.toLowerCase()];

  if (index === undefined) return "";

  return MONTHS[(index + 1) % 12];
}

export function normalizeCards(cards?: ReportCards): Required<ReportCards> {
  return {
    totalRevenue: cards?.totalRevenue ?? DEFAULT_CARDS.totalRevenue,
    totalProfit: cards?.totalProfit ?? DEFAULT_CARDS.totalProfit,
    totalInventory: cards?.totalInventory ?? DEFAULT_CARDS.totalInventory,
    avgMonthlySales: cards?.avgMonthlySales ?? DEFAULT_CARDS.avgMonthlySales,
    growth: cards?.growth ?? DEFAULT_CARDS.growth,
  };
}

function getProfitRatio(cards?: ReportCards) {
  const totalRevenue = parseAmount(cards?.totalRevenue);
  const totalProfit = parseAmount(cards?.totalProfit);

  if (totalRevenue <= 0 || totalProfit < 0) return 0;

  return totalProfit / totalRevenue;
}

export function normalizeMonthlyRows(
  rows: ReportSeriesRow[] = [],
  cards?: ReportCards
): ChartRow[] {
  const safeRows = Array.isArray(rows) ? rows : [];
  const profitRatio = getProfitRatio(cards);

  let previousMonth: string | null = null;

  return safeRows
    .map((item, index) => {
      const sales = parseAmount(item.sales ?? item.value);
      const explicitProfit =
        item.profit !== undefined && item.profit !== null
          ? parseAmount(item.profit)
          : null;

      const apiMonth = normalizeMonthLabel(item.label);
      const inferredMonth = apiMonth || getNextMonthFromPrevious(previousMonth);
      const finalMonth = inferredMonth || `Month ${index + 1}`;

      if (MONTH_LOOKUP[finalMonth.toLowerCase()] !== undefined) {
        previousMonth = finalMonth;
      }

      return {
        label: finalMonth,
        sales,
        profit:
          explicitProfit !== null
            ? explicitProfit
            : profitRatio > 0
              ? Math.round(sales * profitRatio)
              : undefined,
        value: sales,
      };
    })
    .filter((item) => item.sales > 0 || Number(item.profit || 0) > 0);
}

export function normalizeSalesRows(
  rows: ReportSeriesRow[] = [],
  cards?: ReportCards
): ChartRow[] {
  const safeRows = Array.isArray(rows) ? rows : [];
  const profitRatio = getProfitRatio(cards);

  return safeRows
    .map((item, index) => {
      const sales = parseAmount(item.sales ?? item.value);
      const explicitProfit =
        item.profit !== undefined && item.profit !== null
          ? parseAmount(item.profit)
          : null;

      return {
        label: shortLabel(item.label, `Point ${index + 1}`),
        sales,
        profit:
          explicitProfit !== null
            ? explicitProfit
            : profitRatio > 0
              ? Math.round(sales * profitRatio)
              : undefined,
        value: sales,
      };
    })
    .filter((item) => item.sales > 0 || Number(item.profit || 0) > 0);
}

export function normalizeValueRows(rows: ReportSeriesRow[] = []): ChartRow[] {
  const safeRows = Array.isArray(rows) ? rows : [];

  return safeRows
    .map((item, index) => {
      const value = parseAmount(item.value ?? item.sales);

      return {
        label: shortLabel(item.label, `Item ${index + 1}`),
        sales: value,
        value,
      };
    })
    .filter((item) => Number(item.value || 0) > 0);
}