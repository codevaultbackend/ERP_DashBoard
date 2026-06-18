"use client";

import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-backend-w3pb.onrender.com";

export const requestApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

requestApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token") || "";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

/**
 * Turn this false when you don't want console logs.
 */
const DEBUG_REQUEST_API = true;

function logGroup(title: string, callback: () => void) {
  if (!DEBUG_REQUEST_API) return;

  console.group(title);

  try {
    callback();
  } finally {
    console.groupEnd();
  }
}

function logAxiosError(title: string, error: unknown) {
  if (!DEBUG_REQUEST_API) return;

  if (axios.isAxiosError(error)) {
    console.group(title);
    console.log("Status:", error.response?.status);
    console.log("Response data:", error.response?.data);
    console.log("Message:", error.message);
    console.log("URL:", error.config?.url);
    console.log("Method:", error.config?.method);
    console.log("Params:", error.config?.params);
    console.groupEnd();
    return;
  }

  console.error(title, error);
}

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
  selling_price?: number;
  purchase_price?: number;
  rate?: number;
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
  parent_batch_id?: number | null;
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
    gross_weight?: number | string;
    grossWeight?: number | string;
    net_weight?: number | string;
    netWeight?: number | string;
    sale_rate?: number | string;
    selling_price?: number | string;
    sellingPrice?: number | string;
    purchase_rate?: number | string;
    purchase_price?: number | string;
    rate?: number | string;
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
  try {
    logGroup(" GET STOCK CATEGORIES REQUEST", () => {
      console.log("Endpoint:", "/stock/list");
      console.log("Params:", params || {});
    });

    const res = await requestApi.get("/stock/list", { params });

    logGroup(" GET STOCK CATEGORIES RESPONSE", () => {
      console.log("Full response:", res.data);
      console.log("Summary:", res.data?.summary);
      console.log("Count:", res.data?.count);
      console.log(
        "Rows:",
        Array.isArray(res.data?.data) ? res.data.data.length : "data is not array"
      );
      console.table(Array.isArray(res.data?.data) ? res.data.data : []);
    });

    return res.data;
  } catch (error) {
    logAxiosError(" GET STOCK CATEGORIES ERROR", error);
    throw error;
  }
}

export async function getStockItemsByCategory(
  category: string,
  params?: {
    search?: string;
    metal_type?: string;
    organization_id?: number | string;
  }
) {
  const endpoint = `/stock/category/${encodeURIComponent(category)}`;

  try {
    logGroup(" GET STOCK ITEMS BY CATEGORY REQUEST", () => {
      console.log("Endpoint:", endpoint);
      console.log("Category:", category);
      console.log("Params:", params || {});
    });

    const res = await requestApi.get(endpoint, {
      params,
    });

    logGroup(" GET STOCK ITEMS BY CATEGORY RESPONSE", () => {
      console.log("Full response:", res.data);
      console.log("Count:", res.data?.count);
      console.log(
        "Rows:",
        Array.isArray(res.data?.data) ? res.data.data.length : "data is not array"
      );
      console.table(Array.isArray(res.data?.data) ? res.data.data : []);
    });

    return res.data;
  } catch (error) {
    logAxiosError(" GET STOCK ITEMS BY CATEGORY ERROR", error);
    throw error;
  }
}

export async function getMyStockRequests() {
  try {
    logGroup(" GET MY STOCK REQUESTS REQUEST", () => {
      console.log("Endpoint:", "/request/requests/my");
    });

    const res = await requestApi.get("/request/requests/my");

    logGroup(" GET MY STOCK REQUESTS RESPONSE", () => {
      console.log("Full response:", res.data);
      console.log(
        "Rows:",
        Array.isArray(res.data?.data) ? res.data.data.length : "data is not array"
      );
      console.table(Array.isArray(res.data?.data) ? res.data.data : []);

      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      rows.forEach((row: any, index: number) => {
        console.log(`My Request ${index + 1}`, {
          id: row?.id,
          request_no: row?.request_no,
          status: row?.status,
          priority: row?.priority,
          items: row?.request_items,
          transfer: row?.transfer,
          fullRow: row,
        });
      });
    });

    return res.data;
  } catch (error) {
    logAxiosError(" GET MY STOCK REQUESTS ERROR", error);
    throw error;
  }
}

export async function getReceivedStockRequests() {
  try {
    logGroup(" GET RECEIVED STOCK REQUESTS REQUEST", () => {
      console.log("Endpoint:", "/request/requests/received");
    });

    const res = await requestApi.get("/request/requests/received");

    logGroup(" GET RECEIVED STOCK REQUESTS RESPONSE", () => {
      console.log("Full response:", res.data);
      console.log(
        "Rows:",
        Array.isArray(res.data?.data) ? res.data.data.length : "data is not array"
      );
      console.table(Array.isArray(res.data?.data) ? res.data.data : []);

      const rows = Array.isArray(res.data?.data) ? res.data.data : [];
      rows.forEach((row: any, index: number) => {
        console.group(` Received Request ${index + 1}`);
        console.log("Request:", {
          id: row?.id,
          request_no: row?.request_no,
          status: row?.status,
          priority: row?.priority,
          category: row?.category,
          notes: row?.notes,
          transfer: row?.transfer,
        });

        console.log("Request items:", row?.request_items);

        (row?.request_items || []).forEach((itemRow: any, itemIndex: number) => {
          console.log(`Item ${itemIndex + 1}`, {
            item_id: itemRow?.item_id,
            request_qty: itemRow?.request_qty,
            approved_qty: itemRow?.approved_qty,
            item: itemRow?.item,
            gross_weight: itemRow?.item?.gross_weight,
            net_weight: itemRow?.item?.net_weight,
            sale_rate: itemRow?.item?.sale_rate,
            selling_price: itemRow?.item?.selling_price,
            purchase_rate: itemRow?.item?.purchase_rate,
            purchase_price: itemRow?.item?.purchase_price,
            rate: itemRow?.item?.rate,
          });
        });

        console.log("Full row:", row);
        console.groupEnd();
      });
    });

    return res.data;
  } catch (error) {
    logAxiosError(" GET RECEIVED STOCK REQUESTS ERROR", error);
    throw error;
  }
}

export async function createStockRequest(payload: any) {

  const cleanPayload = {
    store_id: Number(payload.store_id),

    priority: ["low", "medium", "high"].includes(payload.priority)
      ? payload.priority
      : "medium",

    category: payload.category || undefined,

    notes: payload.notes?.trim() || undefined,

    items: (payload.items || [])
      .map((item: any) => ({
        item_id: Number(item.item_id),
        request_qty: Number(item.request_qty),
        parent_batch_id: item.parent_batch_id
          ? Number(item.parent_batch_id)
          : null,
      }))
      .filter(
        (item) =>
          item.item_id &&
          item.request_qty > 0
      ),
  }; // <-- missing in your code

  console.group("REQUEST PAYLOAD");

  console.log(cleanPayload);

  console.table(cleanPayload.items);

  console.groupEnd();

  console.group(
    "REQUEST PAYLOAD"
  );

  console.log(cleanPayload);

  console.table(
    cleanPayload.items
  );

  console.groupEnd();

  const res =
    await requestApi.post(
      "/request/requests",
      cleanPayload
    );

  return res.data;
}

export type ApproveDispatchItemPayload = {
  item_id: number;
  qty: number;
  approved_qty?: number;
  parent_batch_id?: number | null;
  weight?: number;
  rate?: number;
  remarks?: string | null;
};

export type ApproveDispatchPayload = {
  requestId: number | string;
  remarks?: string;
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  tracking_number?: string;
  pickup_address: string;
  delivery_address: string;
  expected_delivery_date: string;
  expected_delivery_time?: string;
  additional_notes?: string;
  items: ApproveDispatchItemPayload[];
  driver_photo?: File | null;
  dispatch_images?: File[];
  dispatch_video?: File | null;
  e_way_bill?: File | null;
};

function normalizeApproveDispatchItems(
  items: ApproveDispatchItemPayload[]
) {
  return (items || [])
    .map((item) => {
      const qty = Number(item.qty || item.approved_qty || 0);

      return {
        item_id: Number(item.item_id),
        qty,
        approved_qty: qty,
        parent_batch_id: item.parent_batch_id
          ? Number(item.parent_batch_id)
          : null,
        weight: Number(item.weight || 0),
        rate: Number(item.rate || 0),
        remarks: item.remarks || null,
      };
    })
    .filter((item) => item.item_id > 0 && item.qty > 0);
}

export async function approveDispatchRequest(payload: ApproveDispatchPayload) {
  const formData = new FormData();
  const cleanItems = normalizeApproveDispatchItems(payload.items);

  formData.append("remarks", payload.remarks || "");
  formData.append("driver_name", payload.driver_name.trim());
  formData.append("driver_phone", payload.driver_phone.trim());
  formData.append("vehicle_number", payload.vehicle_number.trim().toUpperCase());
  formData.append("tracking_number", payload.tracking_number?.trim() || "");
  formData.append("pickup_address", payload.pickup_address.trim());
  formData.append("delivery_address", payload.delivery_address.trim());
  formData.append("expected_delivery_date", payload.expected_delivery_date);
  formData.append("expected_delivery_time", payload.expected_delivery_time || "");
  formData.append("additional_notes", payload.additional_notes || "");
  formData.append("items", JSON.stringify(cleanItems));

  if (payload.driver_photo) {
    formData.append("driver_photo", payload.driver_photo);
  }

  (payload.dispatch_images || []).slice(0, 3).forEach((file) => {
    formData.append("dispatch_images", file);
  });

  if (payload.dispatch_video) {
    formData.append("dispatch_video", payload.dispatch_video);
  }

  if (payload.e_way_bill) {
    formData.append("e_way_bill", payload.e_way_bill);
  }

  logGroup("APPROVE DISPATCH PAYLOAD", () => {
    console.log("Endpoint:", `/request/requests/${payload.requestId}/approve-dispatch`);
    console.log("Raw payload:", payload);
    console.log("Clean items:", cleanItems);
    console.table(cleanItems);
    console.log("Files:", {
      driver_photo: payload.driver_photo
        ? {
          name: payload.driver_photo.name,
          type: payload.driver_photo.type,
          size: payload.driver_photo.size,
        }
        : null,
      dispatch_images: (payload.dispatch_images || []).map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
      dispatch_video: payload.dispatch_video
        ? {
          name: payload.dispatch_video.name,
          type: payload.dispatch_video.type,
          size: payload.dispatch_video.size,
        }
        : null,
      e_way_bill: payload.e_way_bill
        ? {
          name: payload.e_way_bill.name,
          type: payload.e_way_bill.type,
          size: payload.e_way_bill.size,
        }
        : null,
    });
  });

  logGroup(" APPROVE DISPATCH FORMDATA", () => {
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(key, {
          fileName: value.name,
          type: value.type,
          size: value.size,
        });
      } else {
        console.log(key, value);
      }
    }
  });

  try {
    const res = await requestApi.put(
      `/request/requests/${payload.requestId}/approve-dispatch`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    logGroup("APPROVE DISPATCH RESPONSE", () => {
      console.log("Full response:", res.data);
    });

    return res.data;
  } catch (error) {
    logAxiosError(" APPROVE DISPATCH ERROR", error);
    throw error;
  }
}

export function getRequestApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
        message?: string;
        error?: string;
        errors?: unknown;
      }
      | undefined;

    if (data?.message) return data.message;
    if (data?.error) return data.error;

    return error.message || "Request failed";
  }

  if (error instanceof Error) return error.message;

  return "Request failed";
}