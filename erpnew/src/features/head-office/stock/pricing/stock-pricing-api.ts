"use client";

import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-backend-w3pb.onrender.com";

export const pricingApi = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

pricingApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("ims_token") ||
      localStorage.getItem("erp_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export type UpdateStockPricingPayload = {
  item_id: number;
  selling_price: number;
  purchase_price?: number;
  making_charge?: number;
};

export type UpdateStockPricingResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
};

function getPricingApiError(error: unknown) {
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
      "Failed to update stock pricing"
    );
  }

  if (error instanceof Error) return error.message;

  return "Failed to update stock pricing";
}

export async function updateStockPricing(
  payload: UpdateStockPricingPayload
) {
  try {
    const cleanPayload: UpdateStockPricingPayload = {
      item_id: Number(payload.item_id),
      selling_price: Number(payload.selling_price),
      ...(payload.purchase_price !== undefined &&
      Number.isFinite(Number(payload.purchase_price))
        ? { purchase_price: Number(payload.purchase_price) }
        : {}),
      ...(payload.making_charge !== undefined &&
      Number.isFinite(Number(payload.making_charge))
        ? { making_charge: Number(payload.making_charge) }
        : {}),
    };

    if (
      !Number.isSafeInteger(cleanPayload.item_id) ||
      cleanPayload.item_id <= 0
    ) {
      throw new Error("Valid numeric item_id is required");
    }

    if (
      !Number.isFinite(cleanPayload.selling_price) ||
      cleanPayload.selling_price <= 0
    ) {
      throw new Error("Valid selling price is required");
    }

    const res = await pricingApi.put<UpdateStockPricingResponse>(
      "stock/update-stock-pricing",
      cleanPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.data;
  } catch (error) {
    throw new Error(getPricingApiError(error));
  }
}