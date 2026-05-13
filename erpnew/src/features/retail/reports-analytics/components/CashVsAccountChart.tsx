"use client";

import { memo, useMemo } from "react";
import { IndianRupee } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CashVsAccountRow, DashboardSummary } from "../types";
import {
  cleanLabel,
  formatAxisCurrency,
  formatINR,
  getNiceYAxis,
  safeNumber,
} from "../utils";
import ReportCard from "./ReportCard";
import SectionHeader from "./SectionHeader";

type Props = {
  data?: CashVsAccountRow[];
  summary?: DashboardSummary;
};

function CashTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;

  return (
    <div className="rounded-erp-xs border border-erp-border bg-erp-card px-4 py-3 shadow-erp-card">
      <div className="space-y-[2px] text-[13px] font-semibold leading-[18px] text-erp-muted">
        <p>
          Cash Received:{" "}
          <span className="text-erp-heading">{formatINR(row.cash)}</span>
        </p>
        <p>
          Account Transfer:{" "}
          <span className="text-erp-heading">{formatINR(row.account)}</span>
        </p>
        <p>
          Total Sales:{" "}
          <span className="text-erp-heading">{formatINR(row.total)}</span>
        </p>
      </div>
    </div>
  );
}

function CashVsAccountChart({ data = [], summary }: Props) {
  const chartData = useMemo(() => {
    return data.map((item, index) => {
      const cash = safeNumber(item.cash);
      const account =
        safeNumber(item.accountTransfer) ||
        safeNumber(item.account) ||
        safeNumber(item.pending);

      const total = safeNumber(item.total) || cash + account;

      return {
        label: cleanLabel(item.day, `Day ${index + 1}`),
        date: item.date,
        cash,
        account,
        total,
      };
    });
  }, [data]);

  const maxChartValue = Math.max(
    safeNumber(summary?.totalCashReceived) + safeNumber(summary?.accountTransfer),
    ...chartData.map((item) => safeNumber(item.total))
  );

  const { yMax, ticks } = getNiceYAxis(maxChartValue);

  return (
    <ReportCard>
      <SectionHeader
        icon={<IndianRupee className="h-5 w-5 text-erp-success" />}
        title="Cash vs Account Reconciliation"
        subtitle="Daily reconciliation of cash and account transfers with total sales"
        className="bg-[#ECFDF5]"
        action={
          <button
            type="button"
            className="inline-flex h-[32px] items-center gap-2 rounded-erp-xs border border-erp-border bg-erp-card px-4 text-[12px] font-semibold text-erp-text-soft shadow-erp-card"
          >
            Daily
            <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        }
      />

      <div className="px-4 pb-5 pt-5 sm:px-5 lg:px-6">
        <div className="h-[310px] w-full rounded-erp-md bg-[#FCFEFD] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 24, right: 18, left: 6, bottom: 18 }}
              barSize={38}
            >
              <CartesianGrid
                vertical
                stroke="var(--color-erp-border)"
                strokeDasharray="2 5"
              />

              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{
                  fill: "var(--color-erp-muted)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
                label={{
                  value: "Day of Week",
                  position: "insideBottom",
                  offset: -10,
                  fill: "var(--color-erp-muted)",
                  fontSize: 12,
                }}
              />

              <YAxis
                tickFormatter={formatAxisCurrency}
                tickLine={false}
                axisLine={false}
                domain={[0, yMax]}
                ticks={ticks}
                width={64}
                tick={{
                  fill: "var(--color-erp-muted)",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />

              <Tooltip cursor={{ fill: "transparent" }} content={<CashTooltip />} />

              <Bar dataKey="total" radius={[7, 7, 0, 0]} fill="#3B93E8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ReportCard>
  );
}

export default memo(CashVsAccountChart);