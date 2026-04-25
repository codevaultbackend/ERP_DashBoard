"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchReportsAnalytics } from "../api";
import { normalizeReportsApiData } from "../utils";
import type { ReportsFilter } from "../types";

export function useReportsAnalytics(filter: ReportsFilter = "daily") {
  const [rawData, setRawData] = useState<any>(null);
  const [role, setRole] = useState<"district" | "retail">("retail");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetchReportsAnalytics(filter);
      setRole(res.role);
      setRawData(res.data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const normalized = useMemo(
    () => normalizeReportsApiData(role, rawData || {}),
    [role, rawData]
  );

  return {
    role,
    summary: normalized.summary,
    cashVsAccountData: normalized.cashVsAccount,
    categorySalesData: normalized.categorySales,
    typeDistributionData: normalized.metalTypeDistribution,
    topProductsData: normalized.topProducts,
    loading,
    error,
    refetch: loadData,
  };
}