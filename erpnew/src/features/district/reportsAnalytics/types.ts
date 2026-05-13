export type DashboardSummaryApi = {
  totalCustomers?: number | string | null;
  totalRevenue?: number | string | null;
  totalSales?: number | string | null;
  totalCashReceived?: number | string | null;
  accountTransfer?: number | string | null;
};

export type CashVsAccountApiRow = {
  date?: string | null;
  day?: string | null;
  cash?: number | string | null;
  pending?: number | string | null;
  total?: number | string | null;
};

export type CategorySalesApiRow = {
  category?: string | null;
  revenue?: number | string | null;
  percentage?: number | string | null;
};

export type TypeDistributionApiRow = {
  metal_type?: string | null;
  type?: string | null;
  name?: string | null;
  revenue?: number | string | null;
  total_revenue?: number | string | null;
  value?: number | string | null;
};

export type TopProductApiRow = {
  rank?: number | string | null;
  product_name?: string | null;
  category?: string | null;
  units_sold?: number | string | null;
  total_revenue?: number | string | null;
  performance?: number | string | null;
};

export type DistrictReportApiResponse = {
  success: boolean;
  message?: string;
  data?: {
    dashboardSummary?: DashboardSummaryApi;
    cashVsAccount?: CashVsAccountApiRow[];
    categorySales?: CategorySalesApiRow[];
    typeDistribution?: TypeDistributionApiRow[];
    topProducts?: TopProductApiRow[];
  };
};

export type ReportsPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type DistrictReportQuery = {
  period?: ReportsPeriod;
  from_date?: string;
  to_date?: string;
  store_code?: string;
};

export type DistrictReportsData = {
  summary: {
    totalCustomers: number;
    totalRevenue: number;
    totalSales: number;
    totalCashReceived: number;
    accountTransfer: number;
  };
  cashVsAccount: {
    date: string;
    day: string;
    cash: number;
    pending: number;
    total: number;
  }[];
  categorySales: {
    category: string;
    revenue: number;
    percentage: number;
  }[];
  typeDistribution: {
    name: string;
    revenue: number;
  }[];
  topProducts: {
    rank: number;
    product_name: string;
    category: string;
    units_sold: number;
    total_revenue: number;
    performance: number;
  }[];
};