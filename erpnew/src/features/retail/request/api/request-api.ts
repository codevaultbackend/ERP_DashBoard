"use client";

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const requestApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

requestApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export type CategoryRowApi = {
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

export type CategoryItemApi = {
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

export type RequestItemApi = {
  id?: number;
  item_id: number;
  request_qty: number;
  approved_qty?: number;
  approved_weight?: number;
  status?: string;
  item?: {
    id: number;
    item_name?: string;
    article_code?: string;
    sku_code?: string;
    category?: string;
    metal_type?: string;
    purity?: string;
    unit?: string;
    gross_weight?: number;
    net_weight?: number;
  };
};

export type TransferApi = {
  id: number;
  transfer_no: string;
  request_id: number;
  status: string;
  remarks?: string | null;
  dispatch_date?: string | null;
  receive_date?: string | null;
};

export type StockRequestApi = {
  id: number;
  request_no: string;
  from_organization_id: number;
  from_store_code?: string | null;
  from_store_name?: string | null;
  to_organization_id: number;
  to_district_code?: string | null;
  to_district_name?: string | null;
  priority: string;
  category?: string | null;
  notes?: string | null;
  remarks?: string | null;
  status: string;
  created_at?: string;
  approved_at?: string | null;
  request_items: RequestItemApi[];
  transfer?: TransferApi | null;
};

export async function getStockCategories(params?: {
  search?: string;
  category?: string;
  metal_type?: string;
}) {
  const res = await requestApi.get("/stock/list", { params });
  return res.data;
}

export async function getStockItemsByCategory(
  category: string,
  params?: {
    search?: string;
    metal_type?: string;
    organization_id?: number | string;
  }
) {
  const res = await requestApi.get(
    `/stock/category/${encodeURIComponent(category)}`,
    {
      params,
    }
  );

  return res.data;
}

export async function getMyStockRequests() {
  const res = await requestApi.get("/request/requests/my");
  return res.data;
}

export async function getReceivedStockRequests() {
  const res = await requestApi.get("/request/requests/received");
  return res.data;
}

export async function createStockRequest(payload: {
  store_id: number | string;
  priority?: string;
  category?: string;
  notes?: string;
  items: Array<{
    item_id: number;
    request_qty: number;
  }>;
}) {
  const res = await requestApi.post("/request/requests", payload);
  return res.data;
}

export async function approveDispatchRequest(payload: {
  requestId: number;
  remarks?: string;
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  tracking_number?: string;
  pickup_address: string;
  delivery_address: string;
  expected_delivery_date: string;
  expected_delivery_time: string;
  additional_notes?: string;
  items: Array<{
    item_id: number;
    qty: number;
    weight?: number;
    rate?: number;
    remarks?: string | null;
  }>;
  driver_photo?: File | null;
  dispatch_images?: File[];
  dispatch_video?: File | null;
  e_way_bill?: File | null;
}) {
  const formData = new FormData();

  formData.append("remarks", payload.remarks || "");
  formData.append("driver_name", payload.driver_name);
  formData.append("driver_phone", payload.driver_phone);
  formData.append("vehicle_number", payload.vehicle_number);
  formData.append("tracking_number", payload.tracking_number || "");
  formData.append("pickup_address", payload.pickup_address);
  formData.append("delivery_address", payload.delivery_address);
  formData.append("expected_delivery_date", payload.expected_delivery_date);
  formData.append("expected_delivery_time", payload.expected_delivery_time);
  formData.append("additional_notes", payload.additional_notes || "");
  formData.append("items", JSON.stringify(payload.items));

  if (payload.driver_photo) {
    formData.append("driver_photo", payload.driver_photo);
  }

  (payload.dispatch_images || []).forEach((file) => {
    formData.append("dispatch_images", file);
  });

  if (payload.dispatch_video) {
    formData.append("dispatch_video", payload.dispatch_video);
  }

  if (payload.e_way_bill) {
    formData.append("e_way_bill", payload.e_way_bill);
  }

  const res = await requestApi.put(
    `/request/requests/${payload.requestId}/approve-dispatch`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
}