"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchReportsAnalytics } from "../api";
import type { ReportsApiData } from "../types";

export function useReportsAnalytics() {
  const [data, setData] = useState<ReportsApiData>({
    dashboardSummary: {},
    cashVsAccount: [],
    categorySales: [],
    typeDistribution: [],
    topProducts: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await fetchReportsAnalytics();
      setData(result);
    } catch (err: any) {
      console.error("Reports analytics fetch error:", err);

      setError(err?.message || "Failed to fetch reports");
      setData({
        dashboardSummary: {},
        cashVsAccount: [],
        categorySales: [],
        typeDistribution: [],
        topProducts: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}