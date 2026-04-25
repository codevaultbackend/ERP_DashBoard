import type {
  DistrictStoreCategoryItemsResponse,
  DistrictStoreDetailResponse,
  DistrictStoreManagementListResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    localStorage.getItem("token") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ||
    ""
  );
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

export async function getDistrictRetailStores(params?: {
  search?: string;
  status?: string;
}) {
  const query = new URLSearchParams();

  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.status?.trim()) query.set("status", params.status.trim());

  return apiFetch<DistrictStoreManagementListResponse>(
    `${API_BASE}/District/district/store-management${
      query.toString() ? `?${query.toString()}` : ""
    }`
  );
}

export async function getDistrictStoreDetail(
  storeId: string,
  params?: { search?: string; category?: string }
) {
  const query = new URLSearchParams();

  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.category?.trim()) query.set("category", params.category.trim());

  return apiFetch<DistrictStoreDetailResponse>(
    `${API_BASE}/District/district/store-management/${storeId}${
      query.toString() ? `?${query.toString()}` : ""
    }`
  );
}

export async function getDistrictStoreCategoryItems(
  storeId: string,
  category: string,
  params?: { search?: string }
) {
  const query = new URLSearchParams();
  if (params?.search?.trim()) query.set("search", params.search.trim());

  return apiFetch<DistrictStoreCategoryItemsResponse>(
    `${API_BASE}/District/district/store-management/${storeId}/categories/${encodeURIComponent(
      category
    )}/items${query.toString() ? `?${query.toString()}` : ""}`
  );
}