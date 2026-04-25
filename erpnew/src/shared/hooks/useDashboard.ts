"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type DashboardResponse = {
  success: boolean;
  message: string;
  data: {
    cards: {
      total_stock: number;
      dead_stock_items: number;
      transit_goods: number;
      gold_price: number;
      silver_price: number;
    };
    charts: {
      sales_trends: Array<{
        day: string;
        date: string;
        sales_count: number;
      }>;
      sales_by_category: Array<{
        category: string;
        count: number;
        percentage: number;
      }>;
    };
    pending_tasks: any[];
    recent_activities: any[];
  };
};

function getTokenFromStorage() {
  if (typeof window === "undefined") return null;

  const possibleKeys = [
    "token",
    "accessToken",
    "authToken",
    "ims_token",
    "imsToken",
    "jwt",
    "refreshToken",
  ];

  for (const key of possibleKeys) {
    const directValue = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (directValue) return directValue;
  }

  const jsonKeys = ["user", "authUser", "auth"];
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
        parsed?.user?.token;

      if (token) return token;
    } catch {
      // ignore invalid JSON
    }
  }

  return null;
}

export function useDashboard() {
  const [data, setData] = useState<DashboardResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchDashboard() {
      try {
        setLoading(true);
        setError(null);

        const token = getTokenFromStorage();

        if (!token) {
          if (!ignore) {
            setData({
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
            });
            setError("No token found");
          }
          return;
        }

        const API_BASE =
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_BACKEND_URL ||
          "";

        if (!API_BASE) {
          throw new Error("NEXT_PUBLIC_API_URL is not configured");
        }

        const url = `${API_BASE.replace(/\/$/, "")}/dash/summary`;

        const response = await axios.get<DashboardResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!ignore) {
          setData(
            response.data?.data ?? {
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
            }
          );
        }
      } catch (err: any) {
        console.error("Dashboard error:", err);

        if (!ignore) {
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Failed to fetch dashboard"
          );

          setData({
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
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  return {
    data,
    loading,
    error,
  };
}