"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
const baseURL = process.env.NEXT_PUBLIC_API_URL

const API_URL =
  `${baseURL}/dash/dashboard/full`;

const CACHE_KEY = "head_office_dashboard_cache";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/* -------------------- TYPES -------------------- */

export type DashboardData = {
  cards: {
    totalStock: number;
    stockValue: number;
    deadStock: {
      count: number;
      percentage: string;
    };
    transitStock: number;
    goldPrice: number;
    silverPrice: number;
  };

  salesPurchaseTrend: {
    label: string;
    sales: number;
    purchase: number;
  }[];

  profitLoss: {
    label: string;
    profit: number;
    loss: number;
  }[];

  revenueTrend: {
    label: string;
    revenue: number;
  }[];

  topProducts: {
    item_name: string;
    units_sold: number;
    revenue: number;
  }[];

  recentActivities: {
    title: string;
    description: string;
    time: string;
  }[];
};

/* -------------------- FALLBACK -------------------- */

const fallback: DashboardData = {
  cards: {
    totalStock: 0,
    stockValue: 0,
    deadStock: { count: 0, percentage: "0%" },
    transitStock: 0,
    goldPrice: 0,
    silverPrice: 0,
  },
  salesPurchaseTrend: [],
  profitLoss: [],
  revenueTrend: [],
  topProducts: [],
  recentActivities: [],
};

/* -------------------- HELPERS -------------------- */

const toNumber = (v: any) =>
  Number.isFinite(Number(v)) ? Number(v) : 0;

const safeString = (v: any) => (v === null || v === undefined ? "" : String(v));

function getToken() {
  if (typeof window === "undefined") return "";
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    ""
  );
}

/* -------------------- CACHE -------------------- */

function getCache(): DashboardData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > CACHE_TTL) return null;

    return parsed.data;
  } catch {
    return null;
  }
}

function setCache(data: DashboardData) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data,
    })
  );
}

/* -------------------- NORMALIZER -------------------- */

function normalize(raw: any): DashboardData {
  const d = raw?.data || {};

  return {
    cards: {
      totalStock: toNumber(d?.cards?.totalStock),
      stockValue: toNumber(d?.cards?.stockValue),
      deadStock: {
        count: toNumber(d?.cards?.deadStock?.count),
        percentage: d?.cards?.deadStock?.percentage || "0%",
      },
      transitStock: toNumber(d?.cards?.transitStock),
      goldPrice: toNumber(d?.cards?.goldPrice),
      silverPrice: toNumber(d?.cards?.silverPrice),
    },

    salesPurchaseTrend: (d?.salesPurchaseTrend || []).map((i: any) => ({
      label: safeString(i?.label),
      sales: toNumber(i?.sales),
      purchase: toNumber(i?.purchase),
    })),

    profitLoss: (d?.profitLoss || []).map((i: any) => ({
      label: safeString(i?.label),
      profit: toNumber(i?.profit),
      loss: toNumber(i?.loss),
    })),

    revenueTrend: (d?.revenueTrend || []).map((i: any) => ({
      label: safeString(i?.label), // FIX null issue
      revenue: toNumber(i?.revenue),
    })),

    topProducts: (d?.topProducts || []).map((i: any) => ({
      item_name: safeString(i?.item_name),
      units_sold: toNumber(i?.units_sold),
      revenue: toNumber(i?.revenue),
    })),

    recentActivities: (d?.recentActivities || []).map((i: any) => ({
      title: safeString(i?.title),
      description: safeString(i?.description),
      time: safeString(i?.time),
    })),
  };
}

/* -------------------- HOOK -------------------- */

export function useHeadOfficeDashboard() {
  const [data, setData] = useState<DashboardData>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async (force = false) => {
    try {
      setLoading(true);
      setError("");

      // 1. return cache first
      if (!force) {
        const cached = getCache();
        if (cached) {
          setData(cached);
          setLoading(false);
          return;
        }
      }

      const token = getToken();

      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      });

      const json = await res.json();

      if (!res.ok || json?.success === false) {
        throw new Error(json?.message || "API failed");
      }

      const normalized = normalize(json);

      setData(normalized);
      setCache(normalized);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");

      // fallback to cache if API fails
      const cached = getCache();
      setData(cached || fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return useMemo(
    () => ({
      ...data,
      loading,
      error,
      refetch: () => fetchDashboard(true),
    }),
    [data, loading, error, fetchDashboard]
  );
}