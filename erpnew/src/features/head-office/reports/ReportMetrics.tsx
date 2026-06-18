"use client";

import { BarChart3, Box, DollarSign, TrendingUp } from "lucide-react";
import type { ReportCards } from "./types";
import { formatPlainNumber } from "./report-utils";
import ReportMetricCard from "./ReportMetricCard";

type Props = {
  cards: Required<ReportCards>;
};

export default function ReportMetrics({ cards }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 max-[768px]:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      <ReportMetricCard
        title="Total Revenue"
        value={cards.totalRevenue}
        growth={cards.growth}
        icon={<DollarSign className="h-6 w-6 text-erp-success" />}
        iconWrapClassName="bg-erp-success-soft"
      />

      <ReportMetricCard
        title="Total Profit"
        value={cards.totalProfit}
        icon={<TrendingUp className="h-6 w-6 text-erp-success" />}
        iconWrapClassName="bg-erp-success-soft"
      />

      <ReportMetricCard
        title="Total Inventory"
        value={formatPlainNumber(cards.totalInventory)}
        icon={<Box className="h-6 w-6 text-erp-purple" />}
        iconWrapClassName="bg-erp-purple-soft"
      />

      <ReportMetricCard
        title="Avg. Monthly Sales"
        value={cards.avgMonthlySales}
        icon={<BarChart3 className="h-6 w-6 text-erp-primary" />}
        iconWrapClassName="bg-erp-blue-soft"
      />
    </div>
  );
}