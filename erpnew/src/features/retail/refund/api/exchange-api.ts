import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://erp-backend-w3pb.onrender.com";

export const exchangeApi = axios.create({
  baseURL: API_URL,

  /**
   * Bearer-token API ke liye cookies required nahi.
   * Agar backend cookie auth use nahi kar raha, false best hai.
   */
  withCredentials: false,
});

function safeJsonParse<T = any>(value: string | null): T | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getTokenFromStorage() {
  if (typeof window === "undefined") return "";

  const directToken =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("ims_token") ||
    localStorage.getItem("erp_token") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("ims_token") ||
    sessionStorage.getItem("erp_token") ||
    "";

  if (directToken) return directToken;

  const user = safeJsonParse<any>(localStorage.getItem("user"));

  return (
    user?.token ||
    user?.accessToken ||
    user?.authToken ||
    user?.jwt ||
    ""
  );
}

function getLoggedInUser() {
  if (typeof window === "undefined") return null;

  return safeJsonParse<any>(localStorage.getItem("user"));
}

function normalizeStoreCode(value: unknown) {
  const clean = String(value ?? "").trim().toUpperCase();
  return clean || "";
}

function getExchangeScope() {
  if (typeof window === "undefined") {
    return {
      store_code: "",
      organization_id: "",
    };
  }

  const user = getLoggedInUser() || {};

  const storeCode = normalizeStoreCode(
    user?.store_code ||
    user?.storeCode ||
    user?.selected_store ||
    user?.store ||
    localStorage.getItem("store_code") ||
    localStorage.getItem("selected_store_code") ||
    localStorage.getItem("storeCode") ||
    localStorage.getItem("selectedStore") ||
    ""
  );

  const organizationId =
    user?.organization_id ||
    user?.organizationId ||
    localStorage.getItem("organization_id") ||
    localStorage.getItem("organizationId") ||
    "";

  return {
    store_code: storeCode,
    organization_id: organizationId,
  };
}

function buildScopeHeaders() {
  const scope = getExchangeScope();

  const headers: Record<string, string> = {};

  /**
   * Backend error bol raha hai:
   * "Store code missing (token ya header me bhejo)"
   *
   * Isliye store_code header me bhejna mandatory hai.
   */
  if (scope.store_code) {
    headers.store_code = scope.store_code;
    headers["x-store-code"] = scope.store_code;
  }

  if (scope.organization_id) {
    headers.organization_id = String(scope.organization_id);
    headers["x-organization-id"] = String(scope.organization_id);
  }

  return headers;
}

exchangeApi.interceptors.request.use(
  (config) => {
    const token = getTokenFromStorage();

    const scopeHeaders = buildScopeHeaders();

    config.headers = {
      ...(config.headers || {}),
      ...scopeHeaders,
      Accept: "application/json",
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * DEBUG
     */
    console.log("================================");
    console.log("Exchange API Request");
    console.log("URL =>", config.baseURL + config.url);
    console.log("TOKEN =>", token);
    console.log("SCOPE HEADERS =>", scopeHeaders);
    console.log("FINAL HEADERS =>", config.headers);
    console.log("================================");

    return config;
  },
  (error) => Promise.reject(error)
);

exchangeApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 400) {
      console.error("Exchange API bad request:", data);
    }

    if (status === 401) {
      console.error("Exchange API unauthorized: token missing or expired.", data);
    }

    if (status === 403) {
      console.error("Exchange API forbidden: role not allowed.", data);
    }

    return Promise.reject(error);
  }
);

export type ExchangeDashboardStats = {
  total_exchanges: number;
  within_7_days: number;
  after_7_days: number;
  making_charges: number;
};

export type ExchangeDashboardItem = {
  id: number;
  exchange_number: string;
  invoice_number: string;
  name: string;
  phone: string;
  invoice_date: string;
  exchange_date: string;
  days_since_purchase: number;

  old_product_code: string;
  old_product_name: string;
  old_purity: string | null;
  old_gross_weight: string | null;
  old_net_weight: string | null;
  old_stone_weight: string | null;
  old_value: string;

  new_product_code: string;
  new_product_name: string;
  new_purity: string | null;
  new_gross_weight: string | null;
  new_net_weight: string | null;
  new_stone_weight: string | null;
  new_value: string;

  making_charges: string;
  difference: string;
};

export type ExchangeDashboardResponse = {
  success: boolean;
  stats: ExchangeDashboardStats;
  count: number;
  data: ExchangeDashboardItem[];
};

export type CreateExchangePayload = {
  invoice_number: string;

  original_products: Array<{
    product_code: string;
    product_name: string;
    value: number;
  }>;

  new_products: Array<{
    product_code: string;
    product_name: string;
    purity: string;
    gross_weight: number;
    net_weight: number;
    stone_weight: number;
    value: number;
  }>;

  making_charge: number;
  stone_amount: number;
};

export type ExchangeInvoiceItem = {
  invoice_id: number;
  product_code: string;
  product_name: string;
  purity: string;
  gross_weight: number;
  net_weight: number;
  stone_weight: number;
  value: number;
};

export type ExchangeInvoiceResponse = {
  success: boolean;
  message: string;
  data: {
    invoice_id: number;
    invoice_number: string;
    customer_name: string;
    phone: string;
    total_items: number;
    items: ExchangeInvoiceItem[];
    latest_exchange_product: {
      product_code: string;
      product_name: string;
      purity: string;
      gross_weight: number;
      net_weight: number;
      stone_weight: number;
      value: number;
    } | null;
  };
};

export type RefundStat = {
  title: string;
  value: string;
  iconType: "total" | "approved" | "pending" | "amount";
  iconWrapClassName: string;
};

export type RefundItem = {
  label: string;
  value: string;
};

export type RefundRequest = {
  id: string;
  customerName: string;
  phone: string;
  billNo: string;

  exchangeDate: string;
  purchaseDate: string;

  statusBadge: string;
  status: "approved" | "pending" | "processing" | "rejected";

  refundReason: string;
  refundMethod: string;
  refundAmount: string;
  deduction: string;
  finalRefund: string;

  old_product_code: string;
  old_product_name: string;
  old_purity: string | null;
  old_net_weight: string | null;
  old_value: string;

  new_product_code: string;
  new_product_name: string;
  new_purity: string | null;
  new_net_weight: string | null;
  new_value: string;

  making_charges: string;
  difference: string;

  expanded?: boolean;
};

let cache: {
  data: ExchangeDashboardResponse;
  time: number;
  token: string;
  scopeKey: string;
} | null = null;

const CACHE_TIME = 60 * 1000;

function formatCurrency(value: number | string | null | undefined) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatShortCurrency(value: number | string | null | undefined) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount)) return "₹0";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;

  return formatCurrency(amount);
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatus(days: number): RefundRequest["status"] {
  if (days <= 7) return "approved";
  return "processing";
}

function getDeduction(days: number) {
  return days <= 7 ? "FREE" : "5%";
}

function getMetalName(productName?: string, purity?: string | null) {
  const name = productName?.toLowerCase() || "";

  if (name.includes("gold")) return purity ? `Gold ${purity}` : "Gold";
  if (name.includes("silver")) return purity ? `Silver ${purity}` : "Silver";
  if (name.includes("diamond")) {
    return purity ? `Diamond ${purity}` : "Diamond";
  }

  return purity || "-";
}

function getWeight(
  grossWeight?: string | null,
  netWeight?: string | null,
  stoneWeight?: string | null
) {
  const gross = Number(grossWeight || 0);
  const net = Number(netWeight || 0);
  const stone = Number(stoneWeight || 0);

  if (gross > 0) return `${gross}g Gross`;
  if (net > 0) return `${net}g Net`;
  if (stone > 0) return `${stone}g Stone`;

  return "-";
}

function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | {
        success?: boolean;
        message?: string;
        error?: string;
      }
      | undefined;

    return (
      data?.message ||
      data?.error ||
      error.message ||
      "Exchange request failed"
    );
  }

  if (error instanceof Error) return error.message;

  return "Exchange request failed";
}

export function mapExchangeStatsToRefundStats(
  stats: ExchangeDashboardStats
): RefundStat[] {
  return [
    {
      title: "Total Exchanges",
      value: String(stats.total_exchanges || 0),
      iconType: "total",
      iconWrapClassName: "bg-[#DBEAFE]",
    },
    {
      title: "Within 7 days",
      value: String(stats.within_7_days || 0),
      iconType: "approved",
      iconWrapClassName: "bg-[#DCFCE7]",
    },
    {
      title: "After 7 days",
      value: String(stats.after_7_days || 0),
      iconType: "pending",
      iconWrapClassName: "bg-[#FDEAD7]",
    },
    {
      title: "Making Charges",
      value: formatShortCurrency(stats.making_charges || 0),
      iconType: "amount",
      iconWrapClassName: "bg-[#F3E8FF]",
    },
  ];
}

export function mapExchangeToRefundRequest(
  item: ExchangeDashboardItem,
  index = 0
): RefundRequest {
  const days = Number(item.days_since_purchase || 0);
  const difference = Number(item.difference || 0);
  const oldValue = Number(item.old_value || 0);
  const makingCharges = Number(item.making_charges || 0);
  const finalAmount = Math.max(0, oldValue + difference);

  return {
    id: item.exchange_number || `EXG-${item.id}`,

    customerName: item.name || "-",
    phone: item.phone || "-",
    billNo: item.invoice_number || "-",

    purchaseDate: formatDate(item.invoice_date),
    exchangeDate: formatDate(item.exchange_date),

    statusBadge: `${days} days since purchase`,
    status: getStatus(days),

    refundReason: "Product exchange",
    refundMethod:
      difference >= 0
        ? "Customer payable"
        : "Store payable",

    refundAmount: formatCurrency(oldValue),
    deduction: getDeduction(days),
    finalRefund: formatCurrency(finalAmount),

    old_product_code:
      item.old_product_code || "-",

    old_product_name:
      item.old_product_name || "-",

    old_purity:
      item.old_purity || "-",

    old_net_weight:
      item.old_net_weight || "-",

    old_value:
      formatCurrency(item.old_value),

    new_product_code:
      item.new_product_code || "-",

    new_product_name:
      item.new_product_name || "-",

    new_purity:
      item.new_purity || "-",

    new_net_weight:
      item.new_net_weight || "-",

    new_value:
      formatCurrency(item.new_value),

    making_charges:
      formatCurrency(makingCharges),

    difference:
      formatCurrency(difference),

    expanded: index === 0,
  };
}

export async function getExchangeDashboard(force = false) {
  const now = Date.now();
  const token = getTokenFromStorage();
  const scope = getExchangeScope();

  if (!token) {
    throw new Error("Authorization token missing. Please login again.");
  }

  if (!scope.store_code) {
    throw new Error("Store code missing. Please login again.");
  }

  const scopeKey = `${scope.store_code || "NO_STORE"}-${scope.organization_id || "NO_ORG"
    }`;

  if (
    !force &&
    cache &&
    cache.token === token &&
    cache.scopeKey === scopeKey &&
    now - cache.time < CACHE_TIME
  ) {
    return cache.data;
  }

  try {
    const res = await exchangeApi.get<ExchangeDashboardResponse>(
      "/exchange/dashboard",
      {
        headers: {
          ...buildScopeHeaders(),
        },
      }
    );

    cache = {
      data: res.data,
      time: now,
      token,
      scopeKey,
    };

    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function getExchangeRefundData(force = false) {
  const response = await getExchangeDashboard(force);

  return {
    success: response.success,
    count: response.count,
    stats: mapExchangeStatsToRefundStats(response.stats),
    requests: response.data.map(mapExchangeToRefundRequest),
    raw: response,
  };
}

export async function getInvoiceForExchange(
  invoiceNumber: string
): Promise<ExchangeInvoiceResponse> {
  const token = getTokenFromStorage();
  const scope = getExchangeScope();

  if (!token) {
    throw new Error(
      "Authorization token missing. Please login again."
    );
  }

  if (!scope.store_code) {
    throw new Error(
      "Store code missing. Please login again."
    );
  }

  try {
    const res =
      await exchangeApi.get<ExchangeInvoiceResponse>(
        `/exchange/invoice/${encodeURIComponent(
          invoiceNumber
        )}`,
        {
          headers: {
            ...buildScopeHeaders(),
          },
        }
      );

    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export async function createExchange(payload: CreateExchangePayload) {
  const token = getTokenFromStorage();
  const scope = getExchangeScope();

  if (!token) {
    throw new Error("Authorization token missing. Please login again.");
  }

  if (!scope.store_code) {
    throw new Error("Store code missing. Please login again.");
  }

  try {
    const res = await exchangeApi.post(
      "/exchange/create",
      {
        invoice_number: payload.invoice_number,

        original_products:
          payload.original_products,

        new_products:
          payload.new_products,

        making_charge:
          payload.making_charge,

        stone_amount:
          payload.stone_amount,

        store_code:
          scope.store_code,

        organization_id:
          scope.organization_id || undefined,
      },
      {
        headers: {
          "Content-Type": "application/json",
          ...buildScopeHeaders(),
        },
      }
    );

    cache = null;

    return res.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
}

export function clearExchangeCache() {
  cache = null;
}

export const refundPolicyPoints = [
  "Products can be exchanged within 7 days with no deduction charges",
  "Exchanges after 7 days may incur 5% deduction on the original product value",
];