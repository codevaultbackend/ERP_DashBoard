export type ReportCards = {
  totalRevenue?: string | number;
  totalProfit?: string | number;
  totalInventory?: number | string;
  avgMonthlySales?: string | number;
  growth?: string | number;
};

export type ReportSeriesRow = {
  label: string | null;
  sales?: number | string;
  value?: number | string;
  profit?: number | string;
};

export type ReportsApiData = {
  cards?: ReportCards;
  monthlyTrend?: ReportSeriesRow[];
  categorySales?: ReportSeriesRow[];
  metalDistribution?: ReportSeriesRow[];
  dailyTrend?: ReportSeriesRow[];
  inventoryAuditReport?: unknown[];
};

export type ReportsApiResponse = {
  success: boolean;
  message?: string;
  data?: ReportsApiData;
};

export type ChartRow = {
  label: string;
  sales: number;
  profit?: number;
  value?: number;
};