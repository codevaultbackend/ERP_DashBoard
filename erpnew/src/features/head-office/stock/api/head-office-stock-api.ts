"use client";

import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-backend-w3pb.onrender.com";

export const headOfficeStockApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

headOfficeStockApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("jwt");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export type HeadOfficeDashboardTableItem = {
  item?: string | null;
  code?: string | null;
  quantity?: number | string | null;
  purchase_rate?: number | string | null;
  selling_price?: number | string | null;
  making_charge?: number | string | null;
  purity?: string | null;
  net_weight?: number | string | null;
  stone_weight?: number | string | null;
  gross_weight?: number | string | null;
};

export type HeadOfficeCategoryItem = {
  id?: number | string;
  item_id?: number | string;
  itemId?: number | string;

  article?: string;
  item?: string;
  item_name?: string;

  code?: string;
  article_code?: string;
  sku_code?: string | null;

  available_qty?: number | string;
  quantity?: number | string;

  purchase_price?: number | string | null;
  purchase_rate?: number | string | null;

  selling_price?: number | string | null;
  sale_rate?: number | string | null;

  making_charge?: number | string | null;

  purity?: string | null;
  net_weight?: number | string | null;
  stone_weight?: number | string | null;
  gross_weight?: number | string | null;

  Item?: {
    id?: number | string;
  };

  item?: {
    id?: number | string;
  };

  itemData?: {
    id?: number | string;
  };

  raw?: any;
};

export type HeadOfficeDashboardResponse = {
  success: boolean;
  message?: string;
  data?: {
    cards?: {
      totalStocksItems?: number;
      deadStockItems?: number;
      lowStock?: number;
      transitGoods?: number;
    };
    table?: HeadOfficeDashboardTableItem[];
  };
};

export type HeadOfficeCategoryResponse = {
  success: boolean;
  message?: string;
  data?: HeadOfficeCategoryItem[];
};

export async function getHeadOfficeStockDashboard() {
  const res = await headOfficeStockApi.get<HeadOfficeDashboardResponse>(
    "/stock/inventory/dashboard"
  );

  return res.data;
}

export async function getHeadOfficeItemsByCategory(category: string) {
  const res = await headOfficeStockApi.get<HeadOfficeCategoryResponse>(
    "/stock/inventory/overall/category",
    {
      params: { category },
    }
  );

  return res.data;
}