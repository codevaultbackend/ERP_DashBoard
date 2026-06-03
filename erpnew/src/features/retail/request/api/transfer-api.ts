"use client";

import axios from "axios";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://erp-backend-w3pb.onrender.com";

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
}

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export type RetailStore = {
  id: number;
  store_code: string;
  store_name: string;
  organization_level: string;
  district_id: number;
};

export type TransferRetailPayload = {
  retail_store_code: string;
  notes?: string;
};

export async function getRetailStoresForTransfer(): Promise<{
  success: boolean;
  data: RetailStore[];
}> {
  try {
    const response = await api.get(
      "/request/district/retail-stores"
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "getRetailStoresForTransfer Error:",
      error?.response?.data || error
    );

    throw error;
  }
}

export async function transferRequestToRetail(
  requestId: number | string,
  payload: TransferRetailPayload
) {
  try {
    if (!requestId) {
      throw new Error("Request ID is missing");
    }

    console.log("========== TRANSFER REQUEST ==========");
    console.log("Request ID:", requestId);
    console.log(
      "URL:",
      `${API_BASE}/request/district/requests/${requestId}/transfer-to-retail`
    );
    console.log("Payload:", payload);
    console.log("======================================");

    const response = await api.post(
      `/request/district/requests/${requestId}/transfer-to-retail`,
      {
        retail_store_code: payload.retail_store_code,
        notes: payload.notes || "",
      }
    );

    console.log(
      "Transfer Success:",
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Transfer Failed:",
      error?.response?.data || error
    );

    throw {
      status: error?.response?.status,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Failed to transfer request",
      data: error?.response?.data,
    };
  }
}