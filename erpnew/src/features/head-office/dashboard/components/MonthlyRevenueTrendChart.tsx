"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import DashboardCard from "./DashboardCard";

type RevenueRow = {
  label: string | null;
  revenue: number;
};

type Props = {
  data?: RevenueRow[] | null;
};

const MONTH_ORDER = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

function toNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

/**
 * ✅ Normalize API data
 */
function normalizeData(data?: RevenueRow[] | null) {
  if (!Array.isArray(data)) return [];

  return data
    .map((item, index) => ({
      month:
        item.label && MONTH_ORDER.includes(item.label)
          ? item.label
          : `M${index + 1}`, // fallback for null
      revenue: toNumber(item.revenue),
    }))
    .sort(
      (a, b) =>
        MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)
    );
}

/**
 * ✅ Ensure minimum points for UI balance
 */
function ensureMinimumPoints(data: { month: string; revenue: number }[]) {
  if (data.length >= 4) return data;

  const fallbackMonths = ["Jan", "Feb", "Mar", "Apr"];

  return fallbackMonths.map((m) => {
    const found = data.find((d) => d.month === m);
    return found || { month: m, revenue: 0 };
  });
}

export default function MonthlyRevenueTrendChart({ data = [] }: Props) {
  const normalized = useMemo(() => normalizeData(data), [data]);

  const chartData = useMemo(
    () => ensureMinimumPoints(normalized),
    [normalized]
  );

  return (
    <DashboardCard title="Monthly Revenue Trend" className="h-full">
      
      {/* Chart */}
      <div className="h-[320px] w-full sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            {/* Grid */}
            <CartesianGrid
              stroke="#E5E7EB"
              strokeDasharray="3 3"
              vertical={false}
            />

            {/* X Axis */}
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              padding={{ left: 10, right: 10 }}
            />

            {/* Y Axis */}
            <YAxis
              tickFormatter={formatCompact}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              width={45}
            />

            {/* Tooltip */}
            <Tooltip
              cursor={{ stroke: "#CBD5F5", strokeWidth: 1 }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                return (
                  <div className="rounded-xl border bg-white px-3 py-2 shadow-md">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {formatCurrency(payload[0].value as number)}
                    </p>
                  </div>
                );
              }}
            />

            {/* Line */}
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: "#3B82F6" }}
              isAnimationActive
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pb-1">
        <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
          <span className="h-3 w-3 rounded-[3px] bg-[#3B82F6]" />
          Revenue
        </span>
      </div>

    </DashboardCard>
  );
}