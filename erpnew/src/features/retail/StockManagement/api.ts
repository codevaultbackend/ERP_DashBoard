export type StockSummary = {
  total_stock_items: number;
  dead_stock_items: number;
  low_stock_items: number;
  transit_goods: number;
};

export type StockListApiItem = {
  category: string;
  code: string;
  quantity: number;
  selling_price: number;
  making_charge: number;
  purity: string;
  net_weight: number;
  stone_weight: number;
  gross_weight: number;
  action?: string;
};

export type StockCategoryApiItem = {
  id?: string | number;
  article?: string;
  image?: string;
  code: string;
  quantity: number;
  purity: string;
  net_weight: number;
  stone_weight: number;
  gross_weight: number;
  category?: string;
};

export type StockListApiResponse = {
  success: boolean;
  message: string;
  summary?: StockSummary;
  count?: number;
  data?: StockListApiItem[];
  debug?: string;
};

export type StockCategoryApiResponse = {
  success: boolean;
  message: string;
  count?: number;
  data?: StockCategoryApiItem[];
  debug?: string;
};

export type StockArticle = {
  id: string;
  image: string;
  article: string;
  code: string;
  quantity: number;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
};

export type StockRow = {
  id: number | string;
  category: string;
  code: string;
  quantity: number;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
  image: string;
  articles?: StockArticle[];
};

export type StockStats = {
  totalStockItems: number;
  deadStockItems: number;
  lowStockItems: number;
  transitGoods: number;
};

const PLACEHOLDER_IMAGE = "/images/placeholder-product.png";

function formatMoney(value?: number) {
  return typeof value === "number" && !Number.isNaN(value)
    ? value.toFixed(2)
    : "0.00";
}

function formatWeight(value?: number) {
  return typeof value === "number" && !Number.isNaN(value)
    ? value.toFixed(3)
    : "0.000";
}

function getTokenFromCookie() {
  if (typeof document === "undefined") return "";

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="));

  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

function getExistingToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || getTokenFromCookie() || "";
}

async function safeFetchJson<T>(url: string): Promise<T> {
  const token = getExistingToken();

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const rawText = await res.text();

  if (!contentType.includes("application/json")) {
    throw new Error(`Non-JSON response from ${url}`);
  }

  let json: T;
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error(`Invalid JSON response from ${url}`);
  }

  if (!res.ok) {
    const maybeMessage =
      typeof json === "object" &&
      json !== null &&
      "message" in json &&
      typeof (json as { message?: unknown }).message === "string"
        ? (json as { message: string }).message
        : `Request failed: ${res.status}`;

    throw new Error(maybeMessage);
  }

  return json;
}

export async function fetchStockList() {
  const json = await safeFetchJson<StockListApiResponse>("/api/stock/list");

  if (!json.success) {
    throw new Error(json.message || "Failed to fetch stock list");
  }

  const rows: StockRow[] = (json.data ?? []).map((item, index) => ({
    id: index + 1,
    category: item.category ?? "Unknown",
    code: item.code ?? "-",
    quantity: Number(item.quantity ?? 0),
    sellingPrice: formatMoney(item.selling_price),
    makingCharge: formatMoney(item.making_charge),
    purity: item.purity ?? "-",
    netWeight: formatWeight(item.net_weight),
    stoneWeight: formatWeight(item.stone_weight),
    grossWeight: formatWeight(item.gross_weight),
    image: PLACEHOLDER_IMAGE,
    articles: [],
  }));

  const categories = ["All", ...Array.from(new Set(rows.map((r) => r.category)))];

  const stats: StockStats = {
    totalStockItems: Number(json.summary?.total_stock_items ?? 0),
    deadStockItems: Number(json.summary?.dead_stock_items ?? 0),
    lowStockItems: Number(json.summary?.low_stock_items ?? 0),
    transitGoods: Number(json.summary?.transit_goods ?? 0),
  };

  return { rows, categories, stats };
}

export async function fetchCategoryItems(category: string): Promise<StockArticle[]> {
  const json = await safeFetchJson<StockCategoryApiResponse>(
    `/api/stock/category/${encodeURIComponent(category)}`
  );

  if (!json.success) {
    throw new Error(json.message || "Failed to fetch category items");
  }

  return (json.data ?? []).map((item, index) => ({
    id: String(item.id ?? item.code ?? `${category}-${index + 1}`),
    image: item.image || PLACEHOLDER_IMAGE,
    article: item.article || item.code || `Article ${index + 1}`,
    code: item.code ?? "-",
    quantity: Number(item.quantity ?? 0),
    purity: item.purity ?? "-",
    netWeight: formatWeight(item.net_weight),
    stoneWeight: formatWeight(item.stone_weight),
    grossWeight: formatWeight(item.gross_weight),
  }));
}