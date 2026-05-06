"use client";

import { memo, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ReportCard from "./ReportCard";
import SectionHeader from "./SectionHeader";
import { formatCurrency, formatCurrencyCompact, safeNumber } from "../utils";

type DailyRow = {
  day?: string;
  label?: string;
  date?: string;
  sales?: number;
  total?: number;
  value?: number;
};

function shortLabel(value: unknown, max = 8) {
  const text = String(value || "-");
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function DailySalesTrendChart({ data = [] }: { data?: DailyRow[] }) {
  const chartData = useMemo(() => {
    return Array.isArray(data)
      ? data.map((item, index) => ({
          day: item.day || item.label || item.date || `${index + 1}`,
          sales:
            safeNumber(item.sales) ||
            safeNumber(item.total) ||
            safeNumber(item.value),
        }))
      : [];
  }, [data]);

  const hasData = chartData.some((item) => safeNumber(item.sales) > 0);

  return (
    <ReportCard className="mt-[22px]">
      <SectionHeader
        icon={<TrendingUp className="h-[18px] w-[18px] text-erp-success" />}
        title="Daily Sales Trend"
        subtitle="Day-by-day sales performance tracking"
        className="bg-[#ECFDF5]"
      />

      <div className="h-[280px] min-w-0 px-3 py-5 sm:h-[330px] sm:px-5 sm:py-6">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" debounce={80}>
            <LineChart
              data={chartData}
              margin={{ top: 16, right: 12, left: -12, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                minTickGap={16}
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

              <Line
                type="monotone"
                dataKey="sales"
                name="Sales"
                stroke="#10B981"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#10B981",
                  strokeWidth: 2,
                  stroke: "#ffffff",
                }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-[14px] font-medium text-erp-muted">
            No daily sales data found
          </div>
        )}
      </div>
    </ReportCard>
  );
}

export default memo(DailySalesTrendChart);