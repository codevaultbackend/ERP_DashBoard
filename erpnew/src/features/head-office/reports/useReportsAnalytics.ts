"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchReportsAnalytics } from "./api";
import type { ReportsApiData } from "./types";
import {
  normalizeCards,
  normalizeMonthlyRows,
  normalizeSalesRows,
  normalizeValueRows,
} from "./report-utils";

export function useReportsAnalytics() {
  const [data, setData] = useState<ReportsApiData>({
    cards: undefined,
    monthlyTrend: [],
    categorySales: [],
    metalDistribution: [],
    dailyTrend: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchReportsAnalytics();

      setData({
        cards: response.data?.cards || undefined,
        monthlyTrend: Array.isArray(response.data?.monthlyTrend)
          ? response.data.monthlyTrend
          : [],
        categorySales: Array.isArray(response.data?.categorySales)
          ? response.data.categorySales
          : [],
        metalDistribution: Array.isArray(response.data?.metalDistribution)
          ? response.data.metalDistribution
          : [],
        dailyTrend: Array.isArray(response.data?.dailyTrend)
          ? response.data.dailyTrend
          : [],
        inventoryAuditReport: response.data?.inventoryAuditReport || [],
      });
    } catch (err: any) {
      console.error("Reports analytics error:", err);

      setError(err?.message || "Failed to fetch reports");

      setData({
        cards: undefined,
        monthlyTrend: [],
        categorySales: [],
        metalDistribution: [],
        dailyTrend: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const normalized = useMemo(() => {
    const cards = normalizeCards(data.cards);

    return {
      cards,
      monthlyTrend: normalizeMonthlyRows(data.monthlyTrend, cards),
      categorySales: normalizeValueRows(data.categorySales),
      metalDistribution: normalizeValueRows(data.metalDistribution),
      dailyTrend: normalizeSalesRows(data.dailyTrend, cards).map((item) => ({
        ...item,
        profit: undefined,
      })),
    };
  }, [data]);

  return {
    data: normalized,
    loading,
    error,
    refetch,
  };
}