import type {
  LedgerCustomerDetailResponse,
  LedgerDashboardResponse,
  LedgerInvoicePaymentDetailResponse,
} from "./types";

/* -------------------------------------------------------------------------- */
/* API CONFIG                                                                  */
/* -------------------------------------------------------------------------- */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "";

const LEDGER_BASE_PATH =
  process.env.NEXT_PUBLIC_LEDGER_BASE_PATH || "/ladger";

function joinUrl(base: string, path: string) {
  const cleanBase = String(base || "").replace(/\/+$/, "");
  const cleanPath = String(path || "").replace(/^\/+/, "");

  if (!cleanBase) return `/${cleanPath}`;
  return `${cleanBase}/${cleanPath}`;
}

function makeLedgerPath(path: string) {
  return joinUrl(LEDGER_BASE_PATH, path);
}

/* -------------------------------------------------------------------------- */
/* AUTH                                                                        */
/* -------------------------------------------------------------------------- */

function normalizeToken(token: string) {
  const cleanToken = String(token || "").trim();

  if (!cleanToken) return "";

  return cleanToken.startsWith("Bearer ")
    ? cleanToken.replace(/^Bearer\s+/i, "")
    : cleanToken;
}

function getAuthToken() {
  if (typeof window === "undefined") return "";

  const possibleKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "ims_token",
    "imsToken",
    "jwt",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);
    if (value) return normalizeToken(value);
  }

  const cookieToken = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return normalizeToken(cookieToken || "");
}

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("authUser") ||
      localStorage.getItem("auth");

    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getStoredRole() {
  if (typeof window === "undefined") return "";

  const explicitRole =
    localStorage.getItem("normalized_role") ||
    localStorage.getItem("role") ||
    localStorage.getItem("organization_level");

  if (explicitRole) return explicitRole;

  const user = getStoredUser();

  return (
    user?.normalized_role ||
    user?.role ||
    user?.organization_level ||
    user?.level ||
    ""
  );
}

function normalizeRole(role: string) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
}

function isDistrictRole(role: string) {
  const normalized = normalizeRole(role);

  return (
    normalized === "district" ||
    normalized === "district-manager" ||
    normalized === "district-tl" ||
    normalized === "district-admin" ||
    normalized.startsWith("district")
  );
}

/* -------------------------------------------------------------------------- */
/* BASE FETCH                                                                  */
/* -------------------------------------------------------------------------- */

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(joinUrl(API_BASE, path), {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

/* -------------------------------------------------------------------------- */
/* DISTRICT RESPONSE TYPES                                                     */
/* -------------------------------------------------------------------------- */

type DistrictLedgerDashboardApiResponse = {
  success: boolean;
  message?: string;
  data: {
    district?: {
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
      source_type?: string;
      source_name?: string;
      source_store_code?: string | null;
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
    district?: {
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
      source_type?: string;
      source_name?: string;
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
      action?: string;
    }>;
  };
};

/* -------------------------------------------------------------------------- */
/* RETAIL ENDPOINTS                                                            */
/* -------------------------------------------------------------------------- */

export async function fetchLedgerDashboard(search = "") {
  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }

  const queryString = query.toString();

  return apiFetch<LedgerDashboardResponse>(
    makeLedgerPath(`/ledger${queryString ? `?${queryString}` : ""}`)
  );
}

export async function fetchLedgerCustomerDetail(customerId: string | number) {
  if (
    !customerId ||
    customerId === "undefined" ||
    customerId === "null"
  ) {
    throw new Error("Valid customerId is required.");
  }

  return apiFetch<LedgerCustomerDetailResponse>(
    makeLedgerPath(`/ledger/customer/${customerId}`)
  );
}

export async function fetchLedgerInvoicePayments(invoiceId: string | number) {
  if (
    !invoiceId ||
    invoiceId === "undefined" ||
    invoiceId === "null"
  ) {
    throw new Error("Valid invoiceId is required for payment history.");
  }

  return apiFetch<LedgerInvoicePaymentDetailResponse>(
    makeLedgerPath(`/payment/invoice/${invoiceId}`)
  );
}

/* -------------------------------------------------------------------------- */
/* DISTRICT ENDPOINTS                                                          */
/* -------------------------------------------------------------------------- */

async function fetchDistrictLedgerDashboard(search = "") {
  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search.trim());
  }

  const queryString = query.toString();

  return apiFetch<DistrictLedgerDashboardApiResponse>(
    makeLedgerPath(`/district${queryString ? `?${queryString}` : ""}`)
  );
}

async function fetchDistrictLedgerCustomerDetail(customerId: string | number) {
  if (
    !customerId ||
    customerId === "undefined" ||
    customerId === "null"
  ) {
    throw new Error("Valid customerId is required.");
  }

  return apiFetch<DistrictLedgerClientDetailApiResponse>(
    makeLedgerPath(`/district/${customerId}`)
  );
}

export async function fetchDistrictLedgerInvoicePayments(
  invoiceId: string | number
) {
  if (
    !invoiceId ||
    invoiceId === "undefined" ||
    invoiceId === "null"
  ) {
    throw new Error("Valid invoiceId is required for district payment history.");
  }

  return apiFetch<LedgerInvoicePaymentDetailResponse>(
    makeLedgerPath(`/payment/invoice-dis/${invoiceId}`)
  );
}

/* -------------------------------------------------------------------------- */
/* DISTRICT -> RETAIL SHAPE ADAPTERS                                           */
/* -------------------------------------------------------------------------- */

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
        total_sales: Number(summary?.total_sales || 0),
        loss: Number(summary?.loss || 0),
        goods_receipt: Number(summary?.goods_receipt || 0),
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
        total_amount: Number(summary?.total_amount || 0),
        received_amount: Number(summary?.received_amount || 0),
        pending_amount: Number(summary?.pending_amount || 0),
      },
      deals: rows.map((row) => ({
        ledger_id: row.invoice_id,
        invoice_number: row.invoice_number || `INV-${row.invoice_id}`,
        date: row.date,
        total_amount: Number(row.total_amount || 0),
        received_amount: Number(row.received_amount || 0),
        pending_amount: Number(row.pending_amount || 0),
        reference_type: "BILL",

        /**
         * Important:
         * Payment tracker and invoice PDF need actual invoice id.
         */
        reference_id: row.invoice_id,

        action: row.action || "View",
      })),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* ROLE-AWARE WRAPPERS                                                         */
/* -------------------------------------------------------------------------- */

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

export async function fetchLedgerInvoicePaymentsByRole(
  invoiceId: string | number
) {
  const role = getStoredRole();

  if (isDistrictRole(role)) {
    return fetchDistrictLedgerInvoicePayments(invoiceId);
  }

  return fetchLedgerInvoicePayments(invoiceId);
}

/* -------------------------------------------------------------------------- */
/* INVOICE PDF VIEW                                                            */
/* -------------------------------------------------------------------------- */

function getFilenameFromContentDisposition(contentDisposition: string | null) {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].replace(/"/g, ""));
    } catch {
      return utf8Match[1].replace(/"/g, "");
    }
  }

  const normalMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  return normalMatch?.[1] || null;
}

export async function fetchInvoicePdfBlob(invoiceId: string | number): Promise<{
  blob: Blob;
  filename: string;
}> {
  if (
    !invoiceId ||
    invoiceId === "undefined" ||
    invoiceId === "null"
  ) {
    throw new Error("Valid invoiceId is required to view invoice.");
  }

  const token = getAuthToken();

  const response = await fetch(
    joinUrl(API_BASE, makeLedgerPath(`/invoice/${invoiceId}/download`)),
    {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/pdf",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    let message = `Failed to load invoice. Status ${response.status}`;

    try {
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        message = data?.message || data?.error || message;
      } else {
        const text = await response.text();
        message = text || message;
      }
    } catch {
      // keep fallback message
    }

    throw new Error(message);
  }

  const blob = await response.blob();

  const filename =
    getFilenameFromContentDisposition(
      response.headers.get("content-disposition")
    ) || `invoice_${invoiceId}.pdf`;

  return {
    blob,
    filename,
  };
}

export async function viewInvoicePdf(invoiceId: string | number) {
  const { blob } = await fetchInvoicePdfBlob(invoiceId);

  const fileUrl = URL.createObjectURL(
    new Blob([blob], {
      type: "application/pdf",
    })
  );

  window.open(fileUrl, "_blank", "noopener,noreferrer");

  setTimeout(() => {
    URL.revokeObjectURL(fileUrl);
  }, 60_000);
}

/* -------------------------------------------------------------------------- */
/* BACKWARD-COMPATIBLE EXPORTS                                                 */
/* -------------------------------------------------------------------------- */

export const getLedgerDashboard = fetchLedgerDashboard;
export const getLedgerInvoiceList = fetchLedgerDashboard;

export const getPaymentsByCustomer = fetchLedgerCustomerDetail;

/**
 * Role based:
 * Retail   -> /payment/invoice/:invoice_id
 * District -> /payment/invoice-dis/:invoice_id
 */
export const getPaymentsByInvoice = fetchLedgerInvoicePaymentsByRole;

export const getLedgerDashboardByRole = fetchLedgerDashboardByRole;
export const getPaymentsByCustomerByRole = fetchLedgerCustomerDetailByRole;