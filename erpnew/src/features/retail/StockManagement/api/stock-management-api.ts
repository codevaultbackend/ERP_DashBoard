"use client";

import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

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

export type StockRole = "retail" | "district" | "head";

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
  idx?: number;
  id: number;
  article_code: string;
  sku_code: string;
  item_name: string;
  metal_type: string;
  category: string;
  details?: string;
  purity: string;
  gross_weight: number;
  net_weight: number;
  stone_weight: number;
  stone_amount?: number;
  making_charge?: number;
  purchase_rate?: number;
  sale_rate?: number;
  hsn_code?: string;
  unit?: string;
  current_status?: string;
  stock_id?: number | null;
  quantity?: number;
  available_qty?: number;
  available_weight?: number;
  reserved_qty?: number;
  reserved_weight?: number;
  transit_qty?: number;
  transit_weight?: number;
  damaged_qty?: number;
  damaged_weight?: number;
  dead_qty?: number;
  dead_weight?: number;
  store_id?: number | null;
  storeCode?: string | null;
  storeName?: string | null;
  organization_level?: string | null;
  organization_id?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  image?: string;
  image_url?: string;
  action?: string;
};

function getListEndpoint(role: StockRole) {
  if (role === "district") return "/stock/getdistrict";

  if (role === "head") return "/stock/list";

  return "/stock/list";
}

function getCategoryEndpoint(category: string) {
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
  const res = await stockApi.get(getCategoryEndpoint(category), { params });
  return res.data;
}

/* -------------------------------------------------------------------------- */
/*                              ADD STOCK ITEM API                            */
/* -------------------------------------------------------------------------- */

export type AddStockPayload = {
  item_name: string;
  metal_type: "Gold" | "Silver";
  category: string;
  purity: string;
  qty: number;
  net_weight: number;
};

export type AddStockResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
};

/**
 * Backend endpoint:
 * POST /stock/stock-in
 *
 * Payload:
 * {
 *   item_name: "Gold Ring",
 *   metal_type: "Gold",
 *   category: "Ring",
 *   purity: "22KT",
 *   qty: 2,
 *   net_weight: 15
 * }
 */
export async function addStockItem(payload: AddStockPayload) {
  const cleanPayload: AddStockPayload = {
    item_name: payload.item_name.trim(),
    metal_type: payload.metal_type,
    category: payload.category.trim(),
    purity: payload.purity.trim(),
    qty: Number(payload.qty),
    net_weight: Number(payload.net_weight),
  };

  const res = await stockApi.post<AddStockResponse>(
    "/stock/stock-in",
    cleanPayload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
}

export function getStockApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
          message?: string;
          error?: string;
        }
      | undefined;

    return (
      data?.message ||
      data?.error ||
      error.message ||
      "Failed to add stock item"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to add stock item";
  
}

export type UploadStockInResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
};

export async function uploadStockInFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await stockApi.post<UploadStockInResponse>(
    "/stock/inventory/stock-in/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
}