"use client";

import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

export type PendingTask = {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | string;
  status: string;
  task_type: string;
  reference_id?: number | null;
  reference_no: string;
  state_code?: string | null;
  district_code?: string | null;
  store_code?: string | null;
  store_name: string;
  assigned_to?: number | null;
  created_by?: number | null;
  updated_by?: number | null;
  createdAt: string;
  updatedAt?: string;
};

export type RecentActivity = {
  id: number;
  title: string;
  description: string;
  activity_type: string;
  module_name: string;
  reference_id?: number | null;
  reference_no: string;
  state_code?: string | null;
  district_code?: string | null;
  store_code?: string | null;
  store_name: string;
  created_by?: number | null;
  created_at: string;
};

export type DashboardData = {
  cards: {
    total_stock: number;
    dead_stock_items: number;
    transit_goods: number;
    gold_price: number;
    silver_price: number;
  };
  charts: {
    sales_trends: {
      day: string;
      date: string;
      sales_count: number;
    }[];
    sales_by_category: {
      category: string;
      count: number;
      percentage: number;
    }[];
  };
  pending_tasks: PendingTask[];
  recent_activities: RecentActivity[];
};

type DashboardResponse = {
  success: boolean;
  message?: string;
  data?: Partial<DashboardData>;
};

export const EMPTY_DASHBOARD: DashboardData = {
  cards: {
    total_stock: 0,
    dead_stock_items: 0,
    transit_goods: 0,
    gold_price: 0,
    silver_price: 0,
  },
  charts: {
    sales_trends: [],
    sales_by_category: [],
  },
  pending_tasks: [],
  recent_activities: [],
};

function cleanToken(token: string | null) {
  if (!token) return null;

  return token.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "").trim();
}

function getTokenFromStorage() {
  if (typeof window === "undefined") return null;

  const directKeys = [
    "token",
    "accessToken",
    "authToken",
    "ims_token",
    "imsToken",
    "jwt",
  ];

  for (const key of directKeys) {
    const token =
      cleanToken(localStorage.getItem(key)) ||
      cleanToken(sessionStorage.getItem(key));

    if (token) return token;
  }

  const jsonKeys = ["user", "authUser", "auth", "session"];

  for (const key of jsonKeys) {
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);

      const token =
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.authToken ||
        parsed?.jwt ||
        parsed?.data?.token ||
        parsed?.data?.accessToken ||
        parsed?.user?.token ||
        parsed?.user?.accessToken;

      const cleaned = cleanToken(token);
      if (cleaned) return cleaned;
    } catch {
      // ignore invalid JSON
    }
  }

  return null;
}

function getApiBase() {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    ""
  ).replace(/\/$/, "");
}

function normalizeDashboard(payload?: Partial<DashboardData>): DashboardData {
  return {
    cards: {
      total_stock: Number(payload?.cards?.total_stock ?? 0),
      dead_stock_items: Number(payload?.cards?.dead_stock_items ?? 0),
      transit_goods: Number(payload?.cards?.transit_goods ?? 0),
      gold_price: Number(payload?.cards?.gold_price ?? 0),
      silver_price: Number(payload?.cards?.silver_price ?? 0),
    },

    charts: {
      sales_trends: Array.isArray(payload?.charts?.sales_trends)
        ? payload.charts.sales_trends.map((item) => ({
            day: String(item.day ?? ""),
            date: String(item.date ?? ""),
            sales_count: Number(item.sales_count ?? 0),
          }))
        : [],

      sales_by_category: Array.isArray(payload?.charts?.sales_by_category)
        ? payload.charts.sales_by_category.map((item) => ({
            category: String(item.category ?? "Other"),
            count: Number(item.count ?? 0),
            percentage: Number(item.percentage ?? 0),
          }))
        : [],
    },

    pending_tasks: Array.isArray(payload?.pending_tasks)
      ? payload.pending_tasks.map((task: any) => ({
          id: Number(task.id ?? 0),
          title: String(task.title ?? ""),
          description: String(task.description ?? ""),
          priority: String(task.priority ?? "low"),
          status: String(task.status ?? ""),
          task_type: String(task.task_type ?? ""),
          reference_id: task.reference_id ?? null,
          reference_no: String(task.reference_no ?? ""),
          state_code: task.state_code ?? null,
          district_code: task.district_code ?? null,
          store_code: task.store_code ?? null,
          store_name: String(task.store_name ?? ""),
          assigned_to: task.assigned_to ?? null,
          created_by: task.created_by ?? null,
          updated_by: task.updated_by ?? null,
          createdAt: String(task.createdAt ?? ""),
          updatedAt: String(task.updatedAt ?? ""),
        }))
      : [],

    recent_activities: Array.isArray(payload?.recent_activities)
      ? payload.recent_activities.map((activity: any) => ({
          id: Number(activity.id ?? 0),
          title: String(activity.title ?? ""),
          description: String(activity.description ?? ""),
          activity_type: String(activity.activity_type ?? ""),
          module_name: String(activity.module_name ?? ""),
          reference_id: activity.reference_id ?? null,
          reference_no: String(activity.reference_no ?? ""),
          state_code: activity.state_code ?? null,
          district_code: activity.district_code ?? null,
          store_code: activity.store_code ?? null,
          store_name: String(activity.store_name ?? ""),
          created_by: activity.created_by ?? null,
          created_at: String(activity.created_at ?? ""),
        }))
      : [],
  };
}

function getErrorMessage(error: unknown) {
  const err = error as AxiosError<any>;

  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Failed to fetch dashboard"
  );
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError(null);

      const token = getTokenFromStorage();
      const apiBase = getApiBase();

      if (!token) throw new Error("No token found. Please login again.");
      if (!apiBase) throw new Error("NEXT_PUBLIC_API_URL is not configured.");

      const response = await axios.get<DashboardResponse>(
        `${apiBase}/dash/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Dashboard fetch failed");
      }

      setData(normalizeDashboard(response.data.data));
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(getErrorMessage(err));
      setData(EMPTY_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}