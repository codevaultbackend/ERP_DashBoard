"use client";

import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-for-local.onrender.com";

export const headOfficeStockApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export type HeadOfficeInventoryResponse = {
  success: boolean;

  summary: {
    total_stock_items: number;
    dead_stock_items: number;
    low_stock_items: number;
    transit_goods: number;
  };

  pagination: {
    page: number;
    limit: number;
  };

  count: number;

  data: HeadOfficeInventoryItem[];
}

export type HeadOfficeInventoryItem = {
  id: number;

  item_name: string;

  article_code: string;

  sku_code: string;

  category: string;

  purity: string;

  available_qty: number;

  quantity: number;

  net_weight: number;

  gross_weight: number;

  stone_weight: number;

  selling_price: number;

  making_charge: number;

  current_status: string;

  store_code: string;

  organization_id: string;

  stocks: {
    id: number;
    item_id: number;
    store_code: string;

    available_qty: number;
    reserved_qty: number;
    transit_qty: number;
    dead_qty: number;
  }[];
}

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
  image?: string | null;
  image_url?: string | null;

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

export async function getHeadOfficeStockDashboard(
  storeCode?: string,
  ownStock = false
): Promise<HeadOfficeInventoryResponse | HeadOfficeDashboardResponse> {

  // User explicitly selected "Own"
  if (ownStock) {
    const res = await headOfficeStockApi.get("/stock/headoffice");
    return res.data;
  }

  // Initial page load (all stores merged)
  if (!storeCode) {
    const res = await headOfficeStockApi.get(
      "/stock/inventory/dashboard"
    );

    return res.data;
  }

  // District / Retail
  const res = await headOfficeStockApi.get(
    "/stock/inventory/dashboard",
    {
      params: {
        store_code: storeCode,
      },
    }
  );

  return res.data;
}


export async function uploadStockInFile(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await headOfficeStockApi.post(
    "/stock/stock-in/upload",
    formData
  );

  return response.data;
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