import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://erp-backend-w3pb.onrender.com";

export const exchangeApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

exchangeApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

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
  original_product: {
    item_id: number;
    product_code: string;
    product_name: string;
    metal: string;
    purity: string;
    gross_weight: number;
    net_weight: number;
    stone_weight: number;
    condition: string;
    value: number;
  };
  new_product: {
    item_id: number;
    product_code: string;
    product_name: string;
    metal: string;
    purity: string;
    gross_weight: number;
    net_weight: number;
    stone_weight: number;
    condition: string;
    value: number;
  };
  making_charge: number;
  stone_amount: number;
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
  productName: string;
  productCode: string;
  metal: string;
  weight: string;
  originalValue: string;
  newProductName: string;
  newProductCode: string;
  newValue: string;
  makingCharges: string;
  difference: string;
  expanded?: boolean;
};

let cache: {
  data: ExchangeDashboardResponse;
  time: number;
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
  if (name.includes("diamond")) return purity ? `Diamond ${purity}` : "Diamond";

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
    refundMethod: difference >= 0 ? "Customer payable" : "Store payable",
    refundAmount: formatCurrency(oldValue),
    deduction: getDeduction(days),
    finalRefund: formatCurrency(finalAmount),

    productName: item.old_product_name || "-",
    productCode: item.old_product_code || "-",
    metal: getMetalName(item.old_product_name, item.old_purity),
    weight: getWeight(
      item.old_gross_weight,
      item.old_net_weight,
      item.old_stone_weight
    ),
    originalValue: formatCurrency(item.old_value),

    newProductName: item.new_product_name || "-",
    newProductCode: item.new_product_code || "-",
    newValue: formatCurrency(item.new_value),
    makingCharges: formatCurrency(makingCharges),
    difference: formatCurrency(difference),

    expanded: index === 0,
  };
}

export async function getExchangeDashboard(force = false) {
  const now = Date.now();

  if (!force && cache && now - cache.time < CACHE_TIME) {
    return cache.data;
  }

  const res = await exchangeApi.get<ExchangeDashboardResponse>(
    "/exchange/dashboard"
  );

  cache = {
    data: res.data,
    time: now,
  };

  return res.data;
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

export async function createExchange(payload: CreateExchangePayload) {
  const res = await exchangeApi.post("/exchange/create", payload);

  cache = null;

  return res.data;
}

export const refundPolicyPoints = [
  "Products can be exchanged within 7 days with no deduction charges",
  "Exchanges after 7 days may incur 5% deduction on the original product value",
];