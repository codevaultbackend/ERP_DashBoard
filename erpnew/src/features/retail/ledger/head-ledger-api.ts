import type {
  HeadCustomerInvoicesResponse,
  HeadLedgerStoresResponse,
  HeadStoreCustomersResponse,
  LedgerInvoicePaymentDetailResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-for-local.onrender.com";

const HEAD_LEDGER_BASE =
  process.env.NEXT_PUBLIC_HEAD_LEDGER_BASE_PATH || "/headledger";

const HEAD_STORE_BASE =
  process.env.NEXT_PUBLIC_HEAD_STORE_LEDGER_BASE_PATH || "/ladger";

/**
 * Your updated endpoints:
 * GET /invoice/:invoice_id/payments
 * GET /invoice/:invoice_id/download-pdf
 *
 * If backend is mounted as app.use("/headledger", routes),
 * final URL becomes /headledger/invoice/:invoice_id/payments
 *
 * If backend is mounted directly as app.use("/", routes),
 * set NEXT_PUBLIC_HEAD_INVOICE_BASE_PATH=
 */
const HEAD_INVOICE_BASE =
  HEAD_LEDGER_BASE;

function joinUrl(base: string, path: string) {
  const cleanBase = String(base || "").replace(/\/+$/, "");
  const cleanPath = String(path || "").replace(/^\/+/, "");

  if (!cleanBase) return `/${cleanPath}`;
  return `${cleanBase}/${cleanPath}`;
}

function isInvalidId(value: unknown) {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "undefined" ||
    value === "null"
  );
}

function normalizeToken(token: string) {
  const cleanToken = String(token || "").trim();
  return cleanToken.replace(/^Bearer\s+/i, "");
}

function getAuthToken() {
  if (typeof window === "undefined") return "";

  const keys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "ims_token",
    "imsToken",
    "jwt",
  ];

  for (const key of keys) {
    const value = localStorage.getItem(key);
    if (value) return normalizeToken(value);
  }

  try {
    const raw =
      localStorage.getItem("user") ||
      localStorage.getItem("authUser") ||
      localStorage.getItem("auth");

    if (raw) {
      const parsed = JSON.parse(raw);
      const token =
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.access_token ||
        parsed?.authToken ||
        parsed?.jwt;

      if (token) return normalizeToken(String(token));
    }
  } catch {
    // ignore invalid localStorage JSON
  }

  const cookieToken = document.cookie
    ?.split("; ")
    ?.find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return normalizeToken(cookieToken || "");
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const url = joinUrl(API_BASE, path);

  const response = await fetch(url, {
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

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data as T;
}

async function exportExcel(path: string, filename: string) {
  const token = getAuthToken();

  const response = await fetch(joinUrl(API_BASE, path), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

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

async function downloadBlob(path: string, fallbackFilename: string) {
  const token = getAuthToken();

  const response = await fetch(joinUrl(API_BASE, path), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/pdf,application/octet-stream,*/*",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let message = `Download failed with status ${response.status}`;

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
    ) || fallbackFilename;

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * GET /headledger/stores
 */
export function fetchHeadLedgerStores() {
  return apiFetch<HeadLedgerStoresResponse>(`${HEAD_LEDGER_BASE}/stores`);
}

/**
 * GET /headledger/store/:store_code/customers
 */
export function fetchHeadStoreCustomers(storeCode: string) {
  const cleanStoreCode = String(storeCode || "").trim();

  if (!cleanStoreCode) {
    throw new Error("store_code is required");
  }

  return apiFetch<HeadStoreCustomersResponse>(
    `/headledger/store/${encodeURIComponent(cleanStoreCode)}/customers`
  );
}

/**
 * GET /headledger/customer/:customer_id/invoices
 */
export function fetchHeadCustomerInvoices(customerId: string | number) {
  if (isInvalidId(customerId)) {
    throw new Error("customer_id is required");
  }

  return apiFetch<HeadCustomerInvoicesResponse>(
    `/headledger/customer/${encodeURIComponent(
      String(customerId)
    )}/invoices`
  );
}

/**
 * Updated payment tracking endpoint:
 * GET /invoice/:invoice_id/payments
 *
 * Default final URL:
 * /headledger/invoice/:invoice_id/payments
 */
export function fetchHeadInvoicePayments(invoiceId: string | number) {
  if (isInvalidId(invoiceId)) {
    throw new Error("invoice_id is required");
  }

  return apiFetch<LedgerInvoicePaymentDetailResponse>(
    `/headledger/invoice/${encodeURIComponent(
      String(invoiceId)
    )}/payments`
  );
}

/**
 * Head Office Invoice PDF Download
 * GET /headledger/invoice/:invoice_id/download-pdf
 */
export function downloadHeadOfficeInvoicePdf(
  invoiceId: string | number
) {
  if (isInvalidId(invoiceId)) {
    throw new Error("invoice_id is required");
  }

  return downloadBlob(
    `${HEAD_INVOICE_BASE}/invoice/${encodeURIComponent(
      String(invoiceId)
    )}/download-pdf`,
    `head-office-invoice-${invoiceId}.pdf`
  );
}

/**
 * Updated invoice PDF endpoint:
 * GET /invoice/:invoice_id/download-pdf
 *
 * Default final URL:
 * /headledger/invoice/:invoice_id/download-pdf
 */
export function downloadHeadInvoicePdf(invoiceId: string | number) {
  if (isInvalidId(invoiceId)) {
    throw new Error("invoice_id is required");
  }

  return downloadBlob(
    `/ladger/invoice/${encodeURIComponent(
      String(invoiceId)
    )}/download`,
    `invoice-${invoiceId}.pdf`
  );
}

export function exportHeadCompleteLedgerExcel() {
  return exportExcel(
    `${HEAD_STORE_BASE}/ledger/download-excel`,
    `head-ledger-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}

export function exportHeadStoreLedgerExcel(storeCode: string) {
  const cleanStoreCode = String(storeCode || "").trim();

  if (!cleanStoreCode) {
    throw new Error("store_code is required");
  }

  return exportExcel(
    `${HEAD_LEDGER_BASE}/ledger/${encodeURIComponent(cleanStoreCode)}`,
    `ledger-${cleanStoreCode}-${new Date().toISOString().slice(0, 10)}.xlsx`
  );
}