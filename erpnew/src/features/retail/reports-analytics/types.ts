export type DashboardSummary = {
  totalCustomers?: number;
  totalRevenue?: number;
  totalSales?: number;
  totalCashReceived?: number;
  accountTransfer?: number;
};

export type CashVsAccountRow = {
  date?: string;
  day?: string;
  cash?: number;
  pending?: number;
  accountTransfer?: number;
  account?: number;
  total?: number;
};

export type CategorySalesRow = {
  category?: string;
  label?: string;
  revenue?: number;
  value?: number;
  percentage?: number;
};

export type TypeDistributionRow = {
  label?: string;
  value?: number;
};

export type TopProductRow = {
  rank?: number;
  product_name?: string;
  name?: string;
  category?: string;
  units_sold?: number;
  unitsSold?: number;
  total_revenue?: number;
  totalRevenue?: number;
  performance?: number;
};

export type ReportsApiData = {
  dashboardSummary?: DashboardSummary;
  cashVsAccount?: CashVsAccountRow[];
  categorySales?: CategorySalesRow[];
  typeDistribution?: TypeDistributionRow[];
  topProducts?: TopProductRow[];
};

export type ReportsApiResponse = {
  success?: boolean;
  message?: string;
  data?: ReportsApiData;
};