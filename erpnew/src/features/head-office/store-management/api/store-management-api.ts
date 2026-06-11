const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://erp-backend-w3pb.onrender.com";

const STORE_MANAGEMENT_BASE = `${API_BASE_URL}/headstore/manage`;

function getToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

async function apiRequest<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = getToken();

  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
    cache: "no-store",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.success === false) {
    throw new Error(json?.message || json?.error || "API request failed");
  }

  return json as T;
}

export type StoreLevel = "Head" | "District" | "Retail" | string;

export type CreateStorePayload = {
  store_name: string;
  level: StoreLevel;
  address: string;
  pincode: string;
  store_code: string;
  district_store_code?: string;
};

export type MapStoresToDistrictPayload = {
  district_store_code: string;
  store_codes: string[];
};

export type DashboardStore = {
  id?: number | string;
  store_name?: string;
  name?: string;
  store_code?: string;
  code?: string;
  level?: string;
  status?: string;
  address?: string;
  pincode?: string;
};

export type DashboardResponse = {
  success: boolean;
  message?: string;
  data?: {
    summary?: {
      totalStores?: number;
      total_stores?: number;
      activeStores?: number;
      active_stores?: number;
      totalEmployees?: number;
      total_employees?: number;
      totalRevenue?: number;
      total_revenue?: number;
    };
    districts?: DashboardStore[];
    districtStores?: DashboardStore[];
    district_stores?: DashboardStore[];
    stores?: DashboardStore[];
    unmappedStores?: DashboardStore[];
    unmapped_stores?: DashboardStore[];
    retailStores?: DashboardStore[];
    retail_stores?: DashboardStore[];
    nonAssignedStores?: DashboardStore[];
    non_assigned_stores?: DashboardStore[];
  };
};

export type InventoryRow = {
  id?: number | string;
  item_id?: number | string;
  category?: string;
  item_name?: string;
  article?: string;
  code?: string;
  sku_code?: string;
  article_code?: string;
  quantity?: number | string;
  qty?: number | string;
  available_qty?: number | string;
  selling_price?: number | string;
  sale_rate?: number | string;
  rate?: number | string;
  making_charge?: number | string;
  making_charges?: number | string;
  purity?: string;
  net_weight?: number | string;
  stone_weight?: number | string;
  gross_weight?: number | string;
  image?: string;
  image_url?: string;
  item_image?: string;
  status?: string;
};

export async function getStoreDashboard() {
  return apiRequest<DashboardResponse>(`${STORE_MANAGEMENT_BASE}/dashboard`);
}

export async function createHeadStore(payload: CreateStorePayload) {
  return apiRequest<{
    success: boolean;
    message?: string;
    data?: DashboardStore;
    store?: DashboardStore;
  }>(`${STORE_MANAGEMENT_BASE}/create`, {
    method: "POST",
    body: payload,
  });
}

export async function mapStoresToDistrict(payload: MapStoresToDistrictPayload) {
  const cleanDistrictCode = String(payload.district_store_code || "")
    .trim()
    .toUpperCase();

  const cleanStoreCodes = (payload.store_codes || [])
    .map((code) => String(code || "").trim().toUpperCase())
    .filter(Boolean);

  if (!cleanDistrictCode) {
    throw new Error("District store code is required for mapping.");
  }

  if (cleanStoreCodes.length === 0) {
    return {
      success: true,
      message: "No stores selected for mapping.",
      data: null,
    };
  }

  return apiRequest<{
    success: boolean;
    message?: string;
    data?: unknown;
  }>(`${STORE_MANAGEMENT_BASE}/map-stores-to-district`, {
    method: "POST",
    body: {
      district_store_code: cleanDistrictCode,
      store_codes: cleanStoreCodes,

      // Backend compatibility aliases.
      district_code: cleanDistrictCode,
      retail_store_codes: cleanStoreCodes,
      stores: cleanStoreCodes,
    },
  });
}

export async function getDistrictInventory(storeCode: string, category?: string) {
  const cleanStoreCode = String(storeCode || "").trim();

  if (!cleanStoreCode) {
    throw new Error("District store code is required for inventory.");
  }

  const query = category ? `?category=${encodeURIComponent(category)}` : "";

  return apiRequest<{ success: boolean; data?: InventoryRow[] }>(
    `${STORE_MANAGEMENT_BASE}/district/${encodeURIComponent(
      cleanStoreCode
    )}/inventory${query}`
  );
}

export async function getRetailStores(storeCode: string) {
  const cleanStoreCode = String(storeCode || "").trim();

  if (!cleanStoreCode) {
    throw new Error("District store code is required.");
  }

  return apiRequest<{ success: boolean; data?: DashboardStore[] }>(
    `${STORE_MANAGEMENT_BASE}/district/${encodeURIComponent(cleanStoreCode)}/stores`
  );
}

export async function getStoreInventory(storeCode: string, category?: string) {
  const cleanStoreCode = String(storeCode || "").trim();

  if (!cleanStoreCode) {
    throw new Error("Store code missing. URL should contain /stores/:store_code.");
  }

  const query = category ? `?category=${encodeURIComponent(category)}` : "";

  return apiRequest<{ success: boolean; data?: InventoryRow[] }>(
    `${STORE_MANAGEMENT_BASE}/store/${encodeURIComponent(
      cleanStoreCode
    )}/inventory${query}`
  );
}