import type {
  LedgerCustomerDetailResponse,
  LedgerDashboardResponse,
  LedgerInvoicePaymentDetailResponse,
} from "./types";

type DistrictLedgerDashboardApiResponse = {
  success: boolean;
  message?: string;
  data: {
    district: {
      organization_id: number | string;
      district_id: number | string | null;
      store_code: string | null;
      store_name: string;
      organization_level?: string;
    };
    summary: {
      total_sales: number;
      loss: number;
      goods_receipt: number;
      total_clients?: number;
      total_amount?: number;
      total_received?: number;
      total_pending?: number;
    };
    clients: Array<{
      customer_id: number | string;
      client_name: string;
      phone: string;
      address: string;
      store_code: string;
      source_type: string;
      source_name: string;
      source_store_code: string | null;
      total_deals: number;
      total_amount: number;
      received_amount: number;
      pending_amount: number;
    }>;
  };
};

type DistrictLedgerClientDetailApiResponse = {
  success: boolean;
  message?: string;
  data: {
    district: {
      organization_id: number | string;
      district_id: number | string | null;
      store_code: string | null;
      store_name: string;
    };
    client: {
      id: number | string;
      name: string;
      phone: string;
      address: string;
      store_code: string;
      source_type: string;
      source_name: string;
    };
    summary: {
      total_deals: number;
      total_amount: number;
      received_amount: number;
      pending_amount: number;
    };
    rows: Array<{
      invoice_id: number | string;
      invoice_number: string;
      date: string | null;
      total_amount: number;
      received_amount: number;
      pending_amount: number;
      action: string;
    }>;
  };
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

function getAuthToken() {
  if (typeof window === "undefined") return "";

  const localToken = localStorage.getItem("token");
  if (localToken) return localToken;

  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return cookieToken || "";
}

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredRole() {
  if (typeof window === "undefined") return "";

  const explicitRole = localStorage.getItem("role");
  if (explicitRole) return explicitRole;

  const user = getStoredUser();
  return (
    user?.normalized_role ||
    user?.role ||
    user?.organization_level ||
    ""
  );
}

function normalizeRole(role: string) {
  return String(role || "").trim().toLowerCase().replace(/_/g, "-");
}

function isDistrictRole(role: string) {
  const normalized = normalizeRole(role);
  return (
    normalized === "district" ||
    normalized === "district-manager" ||
    normalized === "district-tl" ||
    normalized === "district-admin" ||
    normalized === "district-manager" ||
    normalized.startsWith("district")
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

/* ---------------- RETAIL: existing functions unchanged ---------------- */

export async function fetchLedgerDashboard(search = "") {
  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }

  return apiFetch<LedgerDashboardResponse>(
    `${API_BASE}/ladger/ledger${query.toString() ? `?${query.toString()}` : ""}`
  );
}

export async function fetchLedgerCustomerDetail(customerId: string | number) {
  return apiFetch<LedgerCustomerDetailResponse>(
    `${API_BASE}/ladger/ledger/customer/${customerId}`
  );
}

export async function fetchLedgerInvoicePayments(
  invoiceId: string | number
) {
  return apiFetch<LedgerInvoicePaymentDetailResponse>(
    `${API_BASE}/ladger/payment/invoice/${invoiceId}`
  );
}

/* ---------------- DISTRICT raw endpoints ---------------- */

async function fetchDistrictLedgerDashboard(search = "") {
  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }

  return apiFetch<DistrictLedgerDashboardApiResponse>(
    `${API_BASE}/ladger/district${query.toString() ? `?${query.toString()}` : ""}`
  );
}

async function fetchDistrictLedgerCustomerDetail(
  customerId: string | number
) {
  return apiFetch<DistrictLedgerClientDetailApiResponse>(
    `${API_BASE}/ladger/district/${customerId}`
  );
}

/* ---------------- DISTRICT -> RETAIL SHAPE ADAPTERS ---------------- */

function mapDistrictDashboardToRetailShape(
  response: DistrictLedgerDashboardApiResponse
): LedgerDashboardResponse {
  const summary = response?.data?.summary;
  const clients = response?.data?.clients ?? [];

  return {
    success: response.success,
    message: response.message,
    data: {
      summary: {
        total_sales: summary?.total_sales ?? 0,
        loss: summary?.loss ?? 0,
        goods_receipt: summary?.goods_receipt ?? 0,
      },
      clients: clients.map((client) => ({
        customer_id: client.customer_id,
        client_name: client.client_name || "",
        phone: client.phone || "",
        address: client.address || "",
        store_code: client.store_code || "",
        total_deals: Number(client.total_deals || 0),
        total_amount: Number(client.total_amount || 0),
        received_amount: Number(client.received_amount || 0),
        pending_amount: Number(client.pending_amount || 0),
      })),
    },
  };
}

function mapDistrictCustomerDetailToRetailShape(
  response: DistrictLedgerClientDetailApiResponse
): LedgerCustomerDetailResponse {
  const client = response?.data?.client;
  const summary = response?.data?.summary;
  const rows = response?.data?.rows ?? [];

  return {
    success: response.success,
    message: response.message,
    data: {
      customer: {
        id: client?.id ?? "",
        name: client?.name || "",
        phone: client?.phone || "",
        address: client?.address || "",
        store_code: client?.store_code || "",
      },
      summary: {
        total_amount: summary?.total_amount ?? 0,
        received_amount: summary?.received_amount ?? 0,
        pending_amount: summary?.pending_amount ?? 0,
      },
      deals: rows.map((row) => ({
        ledger_id: row.invoice_id,
        invoice_number: row.invoice_number || `INV-${row.invoice_id}`,
        date: row.date,
        total_amount: Number(row.total_amount || 0),
        received_amount: Number(row.received_amount || 0),
        pending_amount: Number(row.pending_amount || 0),
        reference_type: "BILL",
        reference_id: row.invoice_id,
        action: row.action || "View",
      })),
    },
  };
}

/* ---------------- ROLE-AWARE WRAPPERS ---------------- */

export async function fetchLedgerDashboardByRole(search = "") {
  const role = getStoredRole();

  if (isDistrictRole(role)) {
    const districtRes = await fetchDistrictLedgerDashboard(search);
    return mapDistrictDashboardToRetailShape(districtRes);
  }

  return fetchLedgerDashboard(search);
}

export async function fetchLedgerCustomerDetailByRole(
  customerId: string | number
) {
  const role = getStoredRole();

  if (isDistrictRole(role)) {
    const districtRes = await fetchDistrictLedgerCustomerDetail(customerId);
    return mapDistrictCustomerDetailToRetailShape(districtRes);
  }

  return fetchLedgerCustomerDetail(customerId);
}

/* backward-compatible aliases */
export const getLedgerDashboard = fetchLedgerDashboard;
export const getLedgerInvoiceList = fetchLedgerDashboard;
export const getPaymentsByCustomer = fetchLedgerCustomerDetail;
export const getPaymentsByInvoice = fetchLedgerInvoicePayments;

/* new role-aware aliases for reusable flows */
export const getLedgerDashboardByRole = fetchLedgerDashboardByRole;
export const getPaymentsByCustomerByRole = fetchLedgerCustomerDetailByRole;