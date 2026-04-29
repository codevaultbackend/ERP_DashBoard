import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const exchangeApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

exchangeApi.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

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

let cache: {
  data: ExchangeDashboardResponse;
  time: number;
} | null = null;

const CACHE_TIME = 60 * 1000;

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

export async function createExchange(payload: CreateExchangePayload) {
  const res = await exchangeApi.post("/exchange/create", payload);

  cache = null;

  return res.data;
}