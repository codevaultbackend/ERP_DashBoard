"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const stockApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

stockApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export type StockRole = "retail" | "district";

export type StockCategoryRowApi = {
  category: string;
  code?: string;
  quantity: number;
  selling_price?: number;
  making_charge?: number;
  purity?: string;
  net_weight?: number;
  stone_weight?: number;
  gross_weight?: number;
  action?: string;
};

export type StockCategoryItemApi = {
  idx: number;
  id: number;
  article_code: string;
  sku_code: string;
  item_name: string;
  metal_type: string;
  category: string;
  details: string;
  purity: string;
  gross_weight: number;
  net_weight: number;
  stone_weight: number;
  stone_amount: number;
  making_charge: number;
  purchase_rate: number;
  sale_rate: number;
  hsn_code: string;
  unit: string;
  current_status: string;
  stock_id: number | null;
  quantity: number;
  available_qty: number;
  available_weight: number;
  reserved_qty: number;
  reserved_weight: number;
  transit_qty: number;
  transit_weight: number;
  damaged_qty: number;
  damaged_weight: number;
  dead_qty: number;
  dead_weight: number;
  store_id: number | null;
  storeCode: string | null;
  storeName: string | null;
  organization_level: string | null;
  organization_id: number;
  createdAt: string | null;
  updatedAt: string | null;
  action?: string;
};

function getListEndpoint(role: StockRole) {
  if (role === "district") return "/stock/getdistrict";
  return "/stock/list";
}

function getCategoryEndpoint(role: StockRole, category: string) {
  if (role === "district") {
    return `/stock/category/${encodeURIComponent(category)}`;
  }
  return `/stock/category/${encodeURIComponent(category)}`;
}

export async function getStockCategoriesByRole(
  role: StockRole,
  params?: {
    search?: string;
    category?: string;
    metal_type?: string;
  }
) {
  const res = await stockApi.get(getListEndpoint(role), { params });
  return res.data;
}

export async function getStockItemsByCategoryByRole(
  role: StockRole,
  category: string,
  params?: {
    search?: string;
    metal_type?: string;
    organization_id?: number | string;
  }
) {
  const res = await stockApi.get(getCategoryEndpoint(role, category), { params });
  return res.data;
}