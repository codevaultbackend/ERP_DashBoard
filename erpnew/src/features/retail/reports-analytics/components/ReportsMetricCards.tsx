"use client";

import React from "react";
import { ArrowUpRight, BarChart3, CircleDollarSign } from "lucide-react";
import { formatCurrencyCompact } from "../utils";

function safeNumber(value: unknown) {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
}

function MetricCard({
  title,
  value,
  icon,
  iconBg,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="h-[92px] min-w-0 overflow-hidden rounded-erp-xl border border-erp-border bg-erp-card px-[22px] py-[18px] shadow-erp-card">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] ${iconBg}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium leading-[18px] text-erp-text-soft">
            {title}
          </p>

          <h3 className="mt-[2px] min-w-0 truncate text-[24px] font-bold leading-[28px] tracking-[-0.04em] text-erp-dark">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default function ReportsMetricGrid({ summary = {} }: { summary?: any }) {
  const totalCashReceived = safeNumber(summary.totalCashReceived);
  const accountTransfer = safeNumber(summary.accountTransfer);
  const totalSales = safeNumber(summary.totalSales);
  const totalRevenue = safeNumber(summary.totalRevenue);

  return (
    <div className="grid w-full min-w-0 grid-cols-1 gap-[18px] md:grid-cols-3">
      <MetricCard
        title="Total Cash Received"
        value={
          totalCashReceived > 0
            ? formatCurrencyCompact(totalCashReceived)
            : formatCurrencyCompact(totalRevenue)
        }
        icon={
          <CircleDollarSign
            className="h-[22px] w-[22px] text-erp-success"
            strokeWidth={2.2}
          />
        }
        iconBg="bg-erp-success-soft"
      />

      <MetricCard
        title="Account Transfer"
        value={formatCurrencyCompact(accountTransfer)}
        icon={
          <ArrowUpRight
            className="h-[22px] w-[22px] text-erp-primary"
            strokeWidth={2.2}
          />
        }
        iconBg="bg-erp-blue-soft"
      />

      <MetricCard
        title="Total Sales"
        value={totalSales}
        icon={
          <BarChart3
            className="h-[22px] w-[22px] text-erp-purple"
            strokeWidth={2.2}
          />
        }
        iconBg="bg-erp-purple-soft"
      />
    </div>
  );
}