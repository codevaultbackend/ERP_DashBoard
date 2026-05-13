"use client";

import { ArrowUpRight, BarChart3, CircleDollarSign } from "lucide-react";
import type { DashboardSummary } from "../types";
import { formatNumber } from "../utils";
import MetricCard from "./MetricCard";

type ReportsMetricGridProps = {
  summary?: DashboardSummary;
};

export default function ReportsMetricGrid({ summary }: ReportsMetricGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
      <MetricCard
        title="Total Cash Received"
        value={formatNumber(summary?.totalCashReceived)}
        icon={<CircleDollarSign className="h-[22px] w-[22px] text-erp-success" />}
        iconBg="bg-erp-success-soft"
      />

      <MetricCard
        title="Account Transfer"
        value={formatNumber(summary?.accountTransfer)}
        icon={<ArrowUpRight className="h-[22px] w-[22px] text-erp-primary" />}
        iconBg="bg-erp-blue-soft"
      />

      <MetricCard
        title="Total Sales"
        value={formatNumber(summary?.totalSales)}
        icon={<BarChart3 className="h-[22px] w-[22px] text-erp-purple" />}
        iconBg="bg-erp-purple-soft"
      />
    </div>
  );
}