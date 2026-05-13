"use client";

import { memo, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportsTrendRow } from "../types";
import {
  buildChartTicks,
  cleanLabel,
  formatAxisCurrency,
  formatINR,
  safeNumber,
} from "../utils";
import ReportCard from "./ReportCard";
import SectionHeader from "./SectionHeader";

function EmptyState() {
  return (
    <div className="flex h-full min-h-[240px] items-center justify-center rounded-erp-md bg-erp-card-soft text-[14px] font-semibold text-erp-muted">
      No monthly sales trend found
    </div>
  );
}

function SalesTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-erp-xs border border-erp-border bg-erp-card px-4 py-3 shadow-erp-card">
      <p className="text-[13px] font-extrabold text-erp-heading">
        {label || "Sales"}
      </p>
      <p className="mt-1 text-[12px] font-semibold text-erp-muted">
        Sales: <span className="text-erp-heading">{formatINR(payload[0]?.value)}</span>
      </p>
    </div>
  );
}

function MonthlySalesTrendChart({ data = [] }: { data?: ReportsTrendRow[] }) {
  const chartData = useMemo(() => {
    return data
      .map((item, index) => ({
        label: cleanLabel(item.label, `Month ${index + 1}`),
        sales: safeNumber(item.sales ?? item.value),
      }))
      .filter((item) => item.sales > 0);
  }, [data]);

  const maxValue = Math.max(0, ...chartData.map((item) => item.sales));
  const { yMax, ticks } = buildChartTicks(maxValue);

  return (
    <ReportCard>
      <SectionHeader
        icon={<BarChart3 className="h-5 w-5 text-erp-primary" />}
        title="Monthly Sales Trend"
        subtitle="Month-wise revenue performance based on invoice sales"
        className="bg-erp-primary-soft"
        action={
          <span className="inline-flex h-[32px] items-center rounded-erp-xs border border-erp-border bg-erp-card px-4 text-[12px] font-semibold text-erp-text-soft shadow-erp-card">
            Monthly
          </span>
        }
      />

      <div className="px-4 pb-5 pt-5 sm:px-5 lg:px-6">
        <div className="h-[300px] w-full rounded-erp-md bg-erp-card-soft sm:h-[350px]">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 24, right: 18, left: 6, bottom: 18 }}
                barSize={42}
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

                <Tooltip cursor={{ fill: "transparent" }} content={<SalesTooltip />} />

                <Bar dataKey="sales" radius={[8, 8, 0, 0]} fill="#3B93E8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </ReportCard>
  );
}

export default memo(MonthlySalesTrendChart);