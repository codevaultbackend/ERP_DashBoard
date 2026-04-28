export type DistrictDashboardData = {
  summary_cards: {
    total_stock: number;
    retail_stores_stocks: number;
    dead_stock_items: number;
    transit_goods: number;
    gold_price_value: number;
    silver_price_value: number;
  };
  store_performance: {
    store_id: string;
    store_name: string;
    store_code: string;
    revenue: number;
  }[];
  profit_loss: {
    month: string;
    amount: number;
  }[];
  recent_activities: {
    id: number;
    title: string;
    subtitle: string;
    time_ago: string;
  }[];
  extra_summary?: {
    district_id: number;
    district_code: string;
    district_own_stock: number;
    total_inventory_value: number;
    total_stores: number;
    district_item_count: number;
  };
};

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: DistrictDashboardData;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function fetchDistrictDashboard(): Promise<DistrictDashboardData> {
  if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is missing in .env.local");
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : "";

  const res = await fetch(`${API_BASE}/dash/Dis/dash`, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  let json: ApiResponse | null = null;

  try {
    json = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (res.status === 401) {
    throw new Error("Session expired. Please login again.");
  }

  if (!res.ok || !json?.success || !json.data) {
    throw new Error(json?.message || "Failed to load district dashboard");
  }

  return json.data;
}