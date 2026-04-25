export type UserRole =
  | "district_manager"
  | "district_tl"
  | "retail_manager"
  | "retail_tl"
  | "district"
  | "retail"
  | string;

export type ReportsFilter = "daily" | "weekly" | "monthly" | "yearly";

export type SummaryCards = {
  totalCashReceived: number;
  accountTransfer: number;
  totalSales: number;
};

export type CashVsAccountChartItem = {
  label: string;
  cash_received: number;
  account_transfer: number;
  total_sales: number;
};

export type CategoryWiseSalesItem = {
  category: string;
  revenue: number;
  units_sold: number;
};

export type MetalTypeDistributionItem = {
  metal_type: string;
  revenue: number;
  units_sold: number;
};

export type TopPerformingProductItem = {
  rank: number;
  product_name: string;
  category: string;
  units_sold: number;
  total_revenue: number;
  performance: number;
};

export type DistrictReportsApiData = {
  filter: ReportsFilter | string;
  district_id: number;
  stores_count: number;
  store_ids: number[];
  summary: {
    total_cash_received: number;
    account_transfer: number;
    total_sales: number;
  };
  cash_vs_account_reconciliation: CashVsAccountChartItem[];
  category_wise_sales: CategoryWiseSalesItem[];
  metal_type_distribution: MetalTypeDistributionItem[];
  top_performing_products: TopPerformingProductItem[];
};

export type RetailReportsApiData = {
  filter?: ReportsFilter | string;
  summary?: {
    total_cash_received?: number;
    account_transfer?: number;
    total_sales?: number;
  };
  cash_vs_account_reconciliation?: CashVsAccountChartItem[];
  category_wise_sales?: CategoryWiseSalesItem[];
  metal_type_distribution?: MetalTypeDistributionItem[];
  top_performing_products?: TopPerformingProductItem[];

  // optional fallback if your retail api still returns old keys
  dashboardSummary?: {
    totalCashReceived?: number;
    accountTransfer?: number;
    totalSales?: number;
  };
  cashVsAccount?: Array<{
    label?: string;
    day?: string;
    date?: string;
    cash_received?: number;
    cash?: number;
    account_transfer?: number;
    online?: number;
    total_sales?: number;
    total?: number;
  }>;
  categorySales?: Array<{
    category?: string;
    revenue?: number;
    units_sold?: number;
  }>;
  typeDistribution?: Array<{
    metal_type?: string;
    label?: string;
    revenue?: number;
    value?: number;
    units_sold?: number;
  }>;
  topProducts?: Array<{
    rank?: number;
    product_name?: string;
    category?: string;
    units_sold?: number;
    total_revenue?: number;
    performance?: number;
  }>;
};

export type ReportsApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T;
};

export type ReportsUiData = {
  summary: SummaryCards;
  cashVsAccount: Array<{
    label: string;
    cash: number;
    account: number;
    total: number;
  }>;
  categorySales: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  metalTypeDistribution: Array<{
    name: string;
    revenue: number;
    color: string;
  }>;
  topProducts: Array<{
    rank: number;
    name: string;
    category: string;
    unitsSold: number;
    totalRevenue: string;
    performance: number;
    rankColor: string;
    tagClassName: string;
  }>;
};