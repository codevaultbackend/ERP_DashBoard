"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "../lib/apiClient";

type ReportType = "head" | "district" | "retail";
type ReportRange = "daily" | "monthly" | "yearly";

function safeArray(value: any) {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value: any) {
  if (value === null || value === undefined || value === "") return 0;

  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,%\s,]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeSummary(data: any) {
  const summary = data?.dashboardSummary || data?.summary || data?.cards || {};

  const totalRevenue =
    safeNumber(summary.totalRevenue) ||
    safeNumber(summary.total_revenue) ||
    safeNumber(summary.revenue) ||
    safeNumber(summary.total_sales);

  const totalCashReceived =
    safeNumber(summary.totalCashReceived) ||
    safeNumber(summary.total_cash_received) ||
    safeNumber(summary.cash_received) ||
    safeNumber(summary.cash);

  const accountTransfer =
    safeNumber(summary.accountTransfer) ||
    safeNumber(summary.account_transfer) ||
    safeNumber(summary.pending) ||
    safeNumber(summary.account);

  const totalSales =
    safeNumber(summary.totalSales) ||
    safeNumber(summary.total_sales) ||
    safeNumber(summary.sales);

  const totalProfit =
    safeNumber(summary.totalProfit) ||
    safeNumber(summary.total_profit) ||
    safeNumber(summary.profit);

  const totalInventory =
    safeNumber(summary.totalInventory) ||
    safeNumber(summary.total_inventory) ||
    safeNumber(summary.inventory) ||
    totalSales;

  const avgMonthlySales =
    safeNumber(summary.avgMonthlySales) ||
    safeNumber(summary.avg_monthly_sales) ||
    totalRevenue / 12;

  return {
    totalRevenue,
    total_revenue: totalRevenue,

    totalCustomers:
      safeNumber(summary.totalCustomers) ||
      safeNumber(summary.total_customers),

    totalCashReceived,
    total_cash_received: totalCashReceived,

    accountTransfer,
    account_transfer: accountTransfer,

    totalSales,
    total_sales: totalSales,

    totalProfit,
    total_profit: totalProfit,

    totalInventory,
    total_inventory: totalInventory,

    avgMonthlySales,
    avg_monthly_sales: avgMonthlySales,

    growth: summary.growth || "0%",
  };
}

function normalizeCashVsAccount(data: any) {
  const source =
    data?.cashVsAccount ||
    data?.cashVsAccountData ||
    data?.cash_vs_account_reconciliation ||
    data?.cash_vs_account ||
    [];

  return safeArray(source).map((item: any, index: number) => {
    const cash =
      safeNumber(item.cash) ||
      safeNumber(item.cash_received) ||
      safeNumber(item.cashReceived) ||
      safeNumber(item.total_cash_received);

    const account =
      safeNumber(item.pending) ||
      safeNumber(item.account_transfer) ||
      safeNumber(item.accountTransfer) ||
      safeNumber(item.account);

    const total =
      safeNumber(item.total) ||
      safeNumber(item.total_sales) ||
      safeNumber(item.totalSales) ||
      safeNumber(item.sales) ||
      cash + account;

    return {
      label:
        item.label ||
        item.day ||
        item.date ||
        item.month ||
        String(index + 1),

      day:
        item.day ||
        item.label ||
        item.date ||
        item.month ||
        String(index + 1),

      date: item.date || null,

      cash,
      account,
      pending: account,
      total,

      cash_received: cash,
      account_transfer: account,
      total_sales: total,
    };
  });
}

function normalizeCategory(data: any) {
  const source =
    data?.categorySales ||
    data?.categorySalesData ||
    data?.category_sales_data ||
    data?.category_wise_sales ||
    data?.categoryWiseSales ||
    [];

  const rows = safeArray(source).map((item: any) => {
    const category =
      item.category ||
      item.category_name ||
      item.label ||
      item.name ||
      "Unknown";

    const revenue =
      safeNumber(item.revenue) ||
      safeNumber(item.value) ||
      safeNumber(item.total_revenue) ||
      safeNumber(item.totalRevenue) ||
      safeNumber(item.total_sales) ||
      safeNumber(item.totalSales);

    const unitsSold =
      safeNumber(item.units_sold) ||
      safeNumber(item.unitsSold) ||
      safeNumber(item.quantity) ||
      safeNumber(item.qty) ||
      safeNumber(item.count);

    return {
      name: category,
      label: category,
      category,

      // Tumhare API me categorySales.revenue = 32 aa raha hai.
      value: revenue || unitsSold || safeNumber(item.percentage),

      revenue,
      total_revenue: revenue,

      percentage: safeNumber(item.percentage),
      units_sold: unitsSold,
    };
  });

  const total = rows.reduce((sum, item) => sum + safeNumber(item.value), 0);

  return rows.map((item) => ({
    ...item,
    percentage:
      item.percentage ||
      (total > 0 ? Math.round((safeNumber(item.value) / total) * 100) : 0),
  }));
}

function normalizeMetal(data: any) {
  const source =
    data?.typeDistribution ||
    data?.metalDistribution ||
    data?.typeDistributionData ||
    data?.type_distribution_data ||
    data?.metal_type_distribution ||
    [];

  return safeArray(source).map((item: any) => {
    const name =
      item.label ||
      item.name ||
      item.metal_type ||
      item.metalType ||
      item.purity ||
      "Unknown";

    const value =
      safeNumber(item.value) ||
      safeNumber(item.revenue) ||
      safeNumber(item.total_revenue) ||
      safeNumber(item.totalRevenue) ||
      safeNumber(item.units_sold) ||
      safeNumber(item.count);

    return {
      name,
      label: name,
      metal_type: name,

      value,
      revenue: value,
      total_revenue: value,
      units_sold: value,
    };
  });
}

function normalizeTopProducts(data: any) {
  const source =
    data?.topProducts ||
    data?.topProductsData ||
    data?.top_products ||
    data?.top_performing_products ||
    data?.products ||
    [];

  const rows = safeArray(source);

  const maxRevenue = Math.max(
    1,
    ...rows.map((item: any) =>
      safeNumber(
        item.total_revenue ||
          item.totalRevenue ||
          item.revenue ||
          item.amount ||
          item.total ||
          item.total_sales
      )
    )
  );

  return rows.map((item: any, index: number) => {
    const revenue =
      safeNumber(item.total_revenue) ||
      safeNumber(item.totalRevenue) ||
      safeNumber(item.revenue) ||
      safeNumber(item.amount) ||
      safeNumber(item.total) ||
      safeNumber(item.total_sales);

    const unitsSold =
      safeNumber(item.units_sold) ||
      safeNumber(item.unitsSold) ||
      safeNumber(item.quantity) ||
      safeNumber(item.qty) ||
      safeNumber(item.sold_qty);

    return {
      rank: safeNumber(item.rank) || index + 1,

      product_name:
        item.product_name ||
        item.productName ||
        item.item_name ||
        item.name ||
        "Unnamed Product",

      name:
        item.product_name ||
        item.productName ||
        item.item_name ||
        item.name ||
        "Unnamed Product",

      category: item.category || item.category_name || "Uncategorized",

      units_sold: unitsSold,

      total_revenue: revenue,
      totalRevenue: revenue,
      revenue,

      performance:
        safeNumber(item.performance) ||
        Math.round((revenue / maxRevenue) * 100),
    };
  });
}

function normalizeMonthlyTrend(data: any) {
  const source =
    data?.monthlyTrend ||
    data?.monthlyTrendData ||
    data?.monthly_trend_data ||
    [];

  return safeArray(source).map((item: any, index: number) => ({
    label: item.label || item.month || `Month ${index + 1}`,
    month: item.month || item.label || `Month ${index + 1}`,
    sales:
      safeNumber(item.sales) ||
      safeNumber(item.total_sales) ||
      safeNumber(item.totalSales) ||
      safeNumber(item.totalRevenue) ||
      safeNumber(item.total_revenue),
    profit:
      safeNumber(item.profit) ||
      safeNumber(item.total_profit) ||
      safeNumber(item.cash) ||
      safeNumber(item.cash_received),
  }));
}

function normalizeDailyTrend(data: any) {
  const source =
    data?.dailyTrend ||
    data?.dailyTrendData ||
    data?.daily_trend_data ||
    data?.daily_sales_trend ||
    data?.cashVsAccount ||
    [];

  return safeArray(source).map((item: any, index: number) => ({
    label: item.label || item.day || item.date || `${index + 1}`,
    day: item.day || item.label || item.date || `${index + 1}`,
    date: item.date || null,
    sales:
      safeNumber(item.sales) ||
      safeNumber(item.total) ||
      safeNumber(item.total_sales) ||
      safeNumber(item.totalSales) ||
      safeNumber(item.value),
  }));
}

function normalizeInventoryAudit(data: any) {
  const source =
    data?.inventoryAuditReport ||
    data?.inventory_audit_report ||
    data?.auditRows ||
    data?.audit_items ||
    [];

  return safeArray(source).map((item: any, index: number) => ({
    id: item.id || index + 1,
    item: item.item || item.name || item.item_name || "N/A",
    code: item.code || item.article_code || item.product_code || "N/A",
    sku_code: item.sku_code || item.skuCode || "-",
    category: item.category || item.category_name || "-",
    metal_type: item.metal_type || item.metalType || "-",
    purity: item.purity || item.purity_type || "-",
    netWt: item.netWt || item.net_weight || item.netWeight || "0g",
    stoneWt: item.stoneWt || item.stone_weight || item.stoneWeight || "0g",
    grossWt: item.grossWt || item.gross_weight || item.grossWeight || "0g",
    checklist: Boolean(item.checklist),
    audit_status: item.audit_status || item.auditStatus || "pending",
    audit_reason: item.audit_reason || item.auditReason || null,
  }));
}

function resolveArgs(
  arg1?: ReportType | ReportRange,
  arg2?: number | string | ReportType,
  arg3?: ReportRange
) {
  const ranges = ["daily", "monthly", "yearly"];
  const types = ["head", "district", "retail"];

  const a1 = String(arg1 || "");
  const a2 = String(arg2 || "");

  if (ranges.includes(a1) && types.includes(a2)) {
    return {
      type: a2 as ReportType,
      id: undefined,
      range: a1 as ReportRange,
    };
  }

  return {
    type: (types.includes(a1) ? a1 : "head") as ReportType,
    id:
      typeof arg2 === "number" ||
      (arg2 && !types.includes(a2) && !ranges.includes(a2))
        ? arg2
        : undefined,
    range: (arg3 || "daily") as ReportRange,
  };
}

export const useReportsAnalytics = (
  arg1: ReportType | ReportRange = "head",
  arg2?: number | string | ReportType,
  arg3: ReportRange = "daily"
) => {
  const resolved = useMemo(
    () => resolveArgs(arg1, arg2, arg3),
    [arg1, arg2, arg3]
  );

  const type = resolved.type;
  const id = resolved.id;
  const range = resolved.range;

  const [summary, setSummary] = useState<any>({});
  const [cashVsAccountData, setCashVsAccountData] = useState<any[]>([]);
  const [categorySalesData, setCategorySalesData] = useState<any[]>([]);
  const [typeDistributionData, setTypeDistributionData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<any[]>([]);
  const [dailyTrendData, setDailyTrendData] = useState<any[]>([]);
  const [inventoryAuditData, setInventoryAuditData] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getEndpoint = useCallback(() => {
    /**
     * Tumhare latest response ke according district/retail report
     * /dash/report shape use kar raha hai:
     * dashboardSummary, cashVsAccount, categorySales, typeDistribution, topProducts
     */
    return "/dash/report";
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params: any = {
        range,
        filter: range,
      };

      if (type === "district" && id) {
        params.district_id = id;
      }

      if (type === "retail" && id) {
        params.store_id = id;
      }

      const res = await apiClient.get(getEndpoint(), { params });
      const data = res?.data?.data || res?.data || {};

      setSummary(normalizeSummary(data));
      setCashVsAccountData(normalizeCashVsAccount(data));
      setCategorySalesData(normalizeCategory(data));
      setTypeDistributionData(normalizeMetal(data));
      setTopProductsData(normalizeTopProducts(data));
      setMonthlyTrendData(normalizeMonthlyTrend(data));
      setDailyTrendData(normalizeDailyTrend(data));
      setInventoryAuditData(normalizeInventoryAudit(data));

      setMeta({
        filter: data?.filter || range,
        district_id: data?.district_id || data?.districtId || id,
        stores_count: data?.stores_count || data?.storesCount || 0,
        store_ids: data?.store_ids || data?.storeIds || [],
        raw: data,
      });
    } catch (err: any) {
      console.error("REPORT ERROR:", err);

      const message = String(
        err?.response?.data?.message || err?.message || ""
      );

      if (
        message.toLowerCase().includes("no token") ||
        message.toLowerCase().includes("jwt") ||
        message.toLowerCase().includes("session")
      ) {
        setError("Session expired. Please login again.");
      } else {
        setError(message || "Failed to fetch reports");
      }

      setSummary({});
      setCashVsAccountData([]);
      setCategorySalesData([]);
      setTypeDistributionData([]);
      setTopProductsData([]);
      setMonthlyTrendData([]);
      setDailyTrendData([]);
      setInventoryAuditData([]);
      setMeta({});
    } finally {
      setLoading(false);
    }
  }, [getEndpoint, range, type, id]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    summary,
    cashVsAccountData,
    categorySalesData,
    typeDistributionData,
    topProductsData,
    monthlyTrendData,
    dailyTrendData,
    inventoryAuditData,

    monthlySalesProfitData: monthlyTrendData,
    dailySalesTrendData: dailyTrendData,

    meta,
    loading,
    error,
    refetch: fetchReports,
  };
};