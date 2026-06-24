import { AxiosError } from "axios";
import { stockApi } from "./stockApi";

export type AddStockPayload = {
  item_name: string;
  item_code?: string;
  metal_type: "Gold" | "Silver";
  category: string;
  purity: string;
  qty: number;
  net_weight: number;
  stone_weight?: number;
  making_charge?: number;
  image?: File | null;
};

export type AddStockResponse = {
  success: boolean;
  message?: string;
  data?: unknown;
  error?: string;
};

export type AddStockScope = {
  /**
   * Use "district" only from district stock page.
   * Retail page can ignore this.
   */
  role?: "retail" | "district" | "head";
  store_code?: string;
  organization_id?: number | string;
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeStoreCode(value: unknown) {
  const clean = normalizeText(value).toUpperCase();
  return clean || undefined;
}

function normalizeNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function getLoggedInUser() {
  if (typeof window === "undefined") return null;

  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function getLoggedInStoreCode() {
  const user = getLoggedInUser();

  return normalizeStoreCode(
    user?.store_code ||
      localStorage.getItem("store_code") ||
      localStorage.getItem("selected_store_code")
  );
}

function getLoggedInOrganizationId() {
  const user = getLoggedInUser();

  const value =
    user?.organization_id ||
    user?.organizationId ||
    localStorage.getItem("organization_id");

  const id = Number(value);

  return Number.isFinite(id) && id > 0 ? id : undefined;
}

function getApiError(error: unknown) {
  const err = error as AxiosError<{
    success?: boolean;
    message?: string;
    error?: string;
    errors?: unknown;
  }>;

  const responseData = err.response?.data;

  if (Array.isArray(responseData?.errors)) {
    const errors = responseData.errors
      .map((item) => {
        if (typeof item === "string") return item;

        if (
          typeof item === "object" &&
          item !== null &&
          "message" in item
        ) {
          return String((item as { message?: string }).message || "");
        }

        return "";
      })
      .filter(Boolean);

    if (errors.length > 0) {
      return errors.join(", ");
    }
  }

  return (
    responseData?.message ||
    responseData?.error ||
    err.message ||
    "Failed to add stock item"
  );
}

function validateAddStockPayload(payload: AddStockPayload) {
  if (!payload.item_name) {
    throw new Error("Item name is required");
  }

  if (!payload.category) {
    throw new Error("Category is required");
  }

  if (!payload.purity) {
    throw new Error("Purity is required");
  }

  if (!["Gold", "Silver"].includes(payload.metal_type)) {
    throw new Error("Metal type must be Gold or Silver");
  }

  if (!Number.isFinite(payload.qty) || payload.qty <= 0) {
    throw new Error("Quantity must be greater than 0");
  }

  if (!Number.isFinite(payload.net_weight) || payload.net_weight <= 0) {
    throw new Error("Net weight must be greater than 0");
  }
}

/**
 * Existing retail usage still works:
 *
 * addStockItem(payload)
 *
 * District usage:
 *
 * addStockItem(payload, {
 *   role: "district",
 *   store_code: "DIST-4",
 *   organization_id: 4
 * })
 */
export async function addStockItem(
  payload: AddStockPayload
) {
  const formData = new FormData();

  const items = [
  {
    item_name: normalizeText(payload.item_name),
    item_code: normalizeText(payload.item_code),
    metal_type: payload.metal_type,
    category: normalizeText(payload.category),
    purity: normalizeText(payload.purity),

    qty: Number(payload.qty),

    net_weight: Number(payload.net_weight),

    stone_weight: Number(payload.stone_weight || 0),

    making_charge: Number(payload.making_charge || 0),

    selling_price: Number(payload.selling_price || 0),
  },
];

  formData.append(
    "items",
    JSON.stringify(items)
  );

  if (payload.image) {
    formData.append(
      "images",
      payload.image,
      payload.image.name
    );
  }

  const response =
    await stockApi.post<AddStockResponse>(
      "/stock/stock-in",
      formData
    );

  return response.data;
}