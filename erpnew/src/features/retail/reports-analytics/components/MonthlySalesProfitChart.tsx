"use client";

import { memo, useMemo } from "react";
import { LineChart as LineChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ReportCard from "./ReportCard";
import SectionHeader from "./SectionHeader";
import { formatCurrency, formatCurrencyCompact, safeNumber } from "../utils";

type ChartRow = {
  label?: string;
  month?: string;
  sales?: number;
  profit?: number;
};

function shortLabel(value: unknown, max = 8) {
  const text = String(value || "-");
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function hasPositiveData(data: any[]) {
  return data.some(
    (item) => safeNumber(item.sales) > 0 || safeNumber(item.profit) > 0
  );
}

function MonthlySalesProfitChart({ data = [] }: { data?: ChartRow[] }) {
  const chartData = useMemo(() => {
    return Array.isArray(data)
      ? data.map((item) => ({
          label: item.label || item.month || "-",
          sales: safeNumber(item.sales),
          profit: safeNumber(item.profit),
        }))
      : [];
  }, [data]);

  const hasData = hasPositiveData(chartData);

  return (
    <ReportCard className="mt-[22px]">
      <SectionHeader
        icon={<LineChartIcon className="h-[18px] w-[18px] text-[#7C3AED]" />}
        title="Monthly Sales & Profit Trend"
        subtitle="Monthly sales and profitability analysis"
        className="bg-[#F5F3FF]"
      />

      <div className="h-[280px] min-w-0 px-3 pb-4 pt-5 sm:h-[340px] sm:px-5 sm:pb-5 sm:pt-6 xl:h-[390px]">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" debounce={80}>
            <AreaChart
              data={chartData}
              margin={{ top: 16, right: 12, left: -12, bottom: 4 }}
            >
              <defs>
                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.05} />
                </linearGradient>

                <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={14}
                dy={8}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickFormatter={(value) => shortLabel(value, 8)}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={58}
                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                tickFormatter={(v) => formatCurrencyCompact(Number(v))}
              />

              <Tooltip
                formatter={(v: any) => formatCurrency(Number(v))}
                wrapperStyle={{ outline: "none" }}
              />

              <Area
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#2563EB"
                strokeWidth={3}
                fill="url(#salesFill)"
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />

              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#06B6D4"
                strokeWidth={3}
                fill="url(#profitFill)"
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-[14px] font-medium text-erp-muted">
            No monthly trend data found
          </div>
        )}
      </div>
    </ReportCard>
  );
}

export default memo(MonthlySalesProfitChart);