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
    <div className="min-h-[92px] min-w-0 overflow-hidden rounded-erp-xl border border-erp-border bg-erp-card px-3 py-4 shadow-erp-card sm:px-[22px] sm:py-[18px]">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] sm:h-[42px] sm:w-[42px] ${iconBg}`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium leading-[16px] text-erp-text-soft sm:text-[13px] sm:leading-[18px]">
            {title}
          </p>

          <h3 className="mt-[2px] min-w-0 truncate text-[20px] font-bold leading-[24px] tracking-[-0.04em] text-erp-dark sm:text-[24px] sm:leading-[28px]">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}

export default function ReportsMetricGrid({ summary = {} }: { summary?: any }) {
  const totalRevenue = safeNumber(summary.totalRevenue);
  const totalCashReceived = safeNumber(summary.totalCashReceived);
  const accountTransfer = safeNumber(summary.accountTransfer);
  const totalSales = safeNumber(summary.totalSales);

  const firstCardValue =
    totalCashReceived > 0 ? totalCashReceived : totalRevenue;

  const firstCardTitle =
    totalCashReceived > 0 ? "Total Cash Received" : "Total Revenue";

  return (
    <div className="grid w-full min-w-0 grid-cols-2 gap-3 sm:gap-[18px] md:grid-cols-3">
      <MetricCard
        title={firstCardTitle}
        value={formatCurrencyCompact(firstCardValue)}
        icon={
          <CircleDollarSign
            className="h-5 w-5 text-erp-success sm:h-[22px] sm:w-[22px]"
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
            className="h-5 w-5 text-erp-primary sm:h-[22px] sm:w-[22px]"
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
            className="h-5 w-5 text-erp-purple sm:h-[22px] sm:w-[22px]"
            strokeWidth={2.2}
          />
        }
        iconBg="bg-erp-purple-soft"
      />
    </div>
  );
}