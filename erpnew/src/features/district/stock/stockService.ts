import { AxiosError } from "axios";
import { stockApi } from "./stockApi";

export type AddStockPayload = {
  item_name: string;
  metal_type: "Gold" | "Silver";
  category: string;
  purity: string;
  qty: number;
  net_weight: number;

  /**
   * Optional district support.
   * Retail existing flow will not break because these are optional.
   */
  store_code?: string;
  organization_id?: number | string;
};

export type AddStockResponse = {
  success: boolean;
  message: string;
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
  payload: AddStockPayload,
  scope?: AddStockScope
) {
  const role = scope?.role;

  const storeCode = normalizeStoreCode(
    scope?.store_code || payload.store_code || getLoggedInStoreCode()
  );

  const organizationId =
    scope?.organization_id ||
    payload.organization_id ||
    getLoggedInOrganizationId();

  const cleanPayload: AddStockPayload = {
    item_name: normalizeText(payload.item_name),
    metal_type: payload.metal_type,
    category: normalizeText(payload.category),
    purity: normalizeText(payload.purity),
    qty: normalizeNumber(payload.qty),
    net_weight: normalizeNumber(payload.net_weight),
  };

  /**
   * Retail old flow safe:
   * store_code only attach hoga agar:
   * 1. District role hai
   * 2. Ya payload/scope me explicitly store_code diya gaya hai
   */
  const shouldAttachStoreCode =
    role === "district" || Boolean(scope?.store_code) || Boolean(payload.store_code);

  if (shouldAttachStoreCode) {
    if (!storeCode) {
      throw new Error("District store_code is required to add stock");
    }

    cleanPayload.store_code = storeCode;
  }

  if (organizationId) {
    cleanPayload.organization_id = organizationId;
  }

  validateAddStockPayload(cleanPayload);

  try {
    const res = await stockApi.post<AddStockResponse>(
      "/stock/stock-in",
      cleanPayload,
      {
        headers: {
          "Content-Type": "application/json",

          /**
           * Backend compatibility:
           * Agar backend req.headers se store_code / org read karta hai,
           * tab bhi district flow work karega.
           */
          ...(storeCode
            ? {
                store_code: storeCode,
                "x-store-code": storeCode,
              }
            : {}),

          ...(organizationId
            ? {
                organization_id: String(organizationId),
                "x-organization-id": String(organizationId),
              }
            : {}),
        },
      }
    );

    return res.data;
  } catch (error) {
    throw new Error(getApiError(error));
  }
}