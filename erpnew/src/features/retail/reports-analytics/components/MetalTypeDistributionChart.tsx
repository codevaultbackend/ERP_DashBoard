"use client";

import { memo, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ReportCard from "./ReportCard";
import SectionHeader from "./SectionHeader";
import { formatCurrency, formatCurrencyCompact, safeNumber } from "../utils";

const COLORS = ["#F59E0B", "#FBBF24", "#D1D5DB", "#9CA3AF", "#FB923C"];

function shortLabel(value: unknown, max = 10) {
  const text = String(value || "-");
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function MetalTypeDistributionChart({ data = [] }: { data?: any[] }) {
  const chartData = useMemo(() => {
    return Array.isArray(data)
      ? data.map((item, index) => ({
          name: item.name || item.label || item.metal_type || "Unknown",
          revenue:
            safeNumber(item.revenue) ||
            safeNumber(item.value) ||
            safeNumber(item.total_revenue) ||
            safeNumber(item.totalRevenue),
          color: item.color || COLORS[index % COLORS.length],
        }))
      : [];
  }, [data]);

  const hasData = chartData.some((item) => safeNumber(item.revenue) > 0);

  return (
    <ReportCard>
      <SectionHeader
        icon={<BarChart3 className="h-[18px] w-[18px] text-[#F97316]" />}
        title="Metal Type Distribution"
        subtitle="Sales breakdown by metal purity"
        className="bg-[#FFFBEB]"
      />

      <div className="h-[280px] min-w-0 px-3 py-5 sm:h-[330px] sm:px-5 sm:py-6">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%" debounce={80}>
            <BarChart
              data={chartData}
              margin={{ top: 16, right: 12, left: -12, bottom: 4 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                interval={0}
                dy={8}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickFormatter={(value) => shortLabel(value, 10)}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                width={58}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                tickFormatter={(v) => formatCurrencyCompact(Number(v))}
              />

              <Tooltip
                formatter={(v: any) => formatCurrency(Number(v))}
                wrapperStyle={{ outline: "none" }}
              />

              <Bar
                dataKey="revenue"
                name="Revenue"
                radius={[8, 8, 0, 0]}
                maxBarSize={64}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-[14px] font-medium text-erp-muted">
            No metal distribution data found
          </div>
        )}
      </div>
    </ReportCard>
  );
}

export default memo(MetalTypeDistributionChart);