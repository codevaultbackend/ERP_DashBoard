"use client";

export interface BatchNode {
  batch_id: number;
  batch_no: string;
  parent_batch_id: number | null;
  root_batch_id: number | null;
  quantity: number;
  weight: number;
  split_level: number;
  status: string;
}

export interface FinalDestination {
  organization_id: number;
  store_name: string;
  store_code: string;
  organization_level: string;
  quantity: number;
  weight: number;
  last_updated_at: string;
  batch_nodes: BatchNode[];
}

export interface MovementHistory {
  split_id: number;
  root_batch_id: number;
  parent_batch_id: number;
  parent_batch_no: string;
  child_batch_id: number;
  child_batch_no: string;
  item_id: number;
  from_organization_id: number;
  from_store_name: string;
  from_store_code: string;
  from_organization_level: string;
  to_organization_id: number;
  to_store_name: string;
  to_store_code: string;
  to_organization_level: string;
  quantity: number;
  weight: number;
  reference_type: string;
  reference_id: number;
  remarks: string | null;
  created_by: number;
  created_at: string;
}

export interface BatchTrackingResponse {
  success: boolean;
  message: string;
  data: {
    batch: {
      batch_id: number;
      batch_no: string;
      item_id: number;
      item_name: string;
      article_code: string;
      sku_code: string;
      category: string;
      metal_type: string;
      purity: string;
      total_qty: number;
      available_qty: number;
      total_weight: number;
      available_weight: number;
      status: string;
      created_at: string;
      updated_at: string;
    };

    summary: {
      root_batch_id: number;
      total_qty: number;
      total_weight: number;
      current_available_qty: number;
      current_available_weight: number;
      location_count: number;
      movement_count: number;
    };

    final_destinations: FinalDestination[];
    movement_history: MovementHistory[];
  };
}

export interface ItemTrackingResponse {
  success: boolean;
  message: string;
  data: unknown;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(
    /\/$/,
    ""
  ) ||
  "https://erp-for-local.onrender.com";

const REQUEST_TIMEOUT = 30000;

export const getAuthHeaders =
  (): HeadersInit => {
    if (
      typeof window ===
      "undefined"
    ) {
      return {
        "Content-Type":
          "application/json",
      };
    }

    const token =
      localStorage.getItem(
        "token"
      ) ||
      localStorage.getItem(
        "accessToken"
      );

    console.log(
      "🔑 Token Found:",
      !!token
    );

    return {
      "Content-Type":
        "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  };

async function apiRequest<T>(
  endpoint: string,
  signal?: AbortSignal
): Promise<T> {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

  try {
    const url = `${API_BASE}${endpoint}`;

    console.log(
      "🚀 API Request:",
      url
    );

    const response =
      await fetch(url, {
        method: "GET",
        headers:
          getAuthHeaders(),
        cache: "no-store",
        signal:
          signal ||
          controller.signal,
      });

    console.log(
      "📡 Status:",
      response.status
    );

    console.log(
      "📡 Status Text:",
      response.statusText
    );

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    console.log(
      "📡 Content Type:",
      contentType
    );

    let result: any = null;

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      result =
        await response.json();

      console.log(
        "✅ API Response:",
        result
      );
    } else {
      const text =
        await response.text();

      console.error(
        "❌ Non JSON Response:",
        text
      );

      throw new Error(
        text?.includes(
          "<!DOCTYPE"
        )
          ? "Server returned HTML instead of JSON"
          : text ||
              "Unexpected server response"
      );
    }

    if (!response.ok) {
      throw new Error(
        result?.message ||
          `Request failed (${response.status})`
      );
    }

    if (
      result &&
      typeof result ===
        "object" &&
      result.success === false
    ) {
      throw new Error(
        result.message ||
          "API returned success=false"
      );
    }

    return result as T;
  } catch (error) {
    console.error(
      "❌ API Error:",
      error
    );

    if (
      error instanceof
        DOMException &&
      error.name ===
        "AbortError"
    ) {
      throw new Error(
        "Request timeout. Please try again."
      );
    }

    if (
      error instanceof
      TypeError
    ) {
      throw new Error(
        "Network error. Please check your internet connection."
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);

    console.log(
      "🏁 Request Finished:",
      endpoint
    );
  }
}

export const trackingApi = {
  async getBatchFinalDestinations(
    batchId: number,
    signal?: AbortSignal
  ): Promise<BatchTrackingResponse> {
    console.log(
      "📦 Batch Tracking Request:",
      batchId
    );

    if (
      !batchId ||
      Number.isNaN(batchId)
    ) {
      throw new Error(
        "Invalid Batch ID"
      );
    }

    return apiRequest<BatchTrackingResponse>(
      `/item-tracker/batches/${batchId}/final-destinations`,
      signal
    );
  },

  async getItemFinalDestinations(
    itemId: number,
    signal?: AbortSignal
  ): Promise<ItemTrackingResponse> {
    console.log(
      "📦 Item Tracking Request:",
      itemId
    );

    if (
      !itemId ||
      Number.isNaN(itemId)
    ) {
      throw new Error(
        "Invalid Item ID"
      );
    }

    return apiRequest<ItemTrackingResponse>(
      `/item-tracker/items/${itemId}/final-destinations`,
      signal
    );
  },

  async getBatchRoute(
    batchId: number,
    signal?: AbortSignal
  ): Promise<unknown> {
    console.log(
      "🛣️ Batch Route Request:",
      batchId
    );

    if (
      !batchId ||
      Number.isNaN(batchId)
    ) {
      throw new Error(
        "Invalid Batch ID"
      );
    }

    return apiRequest(
      `/item-tracker/batches/${batchId}/route`,
      signal
    );
  },
};