"use client";

import React from "react";
import { ArrowUpRight, BarChart3, CircleDollarSign } from "lucide-react";
import MetricCard from "./MetricCard";
import { formatCurrency } from "../utils";

type Props = {
  summary: {
    totalCashReceived: number;
    accountTransfer: number;
    totalSales: number;
  };
};

export default function ReportsMetricCards({ summary }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <MetricCard
        title="Total Cash Received"
        value={formatCurrency(summary.totalCashReceived)}
        icon={
          <CircleDollarSign className="h-6 w-6 text-[#16A34A]" strokeWidth={2.2} />
        }
        iconWrapClassName="bg-[#DCFCE7]"
      />

      <MetricCard
        title="Account Transfer"
        value={formatCurrency(summary.accountTransfer)}
        icon={
          <ArrowUpRight className="h-6 w-6 text-[#3B82F6]" strokeWidth={2.2} />
        }
        iconWrapClassName="bg-[#DBEAFE]"
      />

      <MetricCard
        title="Total Sales"
        value={formatCurrency(summary.totalSales)}
        icon={<BarChart3 className="h-6 w-6 text-[#A855F7]" strokeWidth={2.2} />}
        iconWrapClassName="bg-[#F3E8FF]"
      />
    </div>
  );
}