"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Rectangle,
} from "recharts";
import DashboardCard from "./DashboardCard";

type SalesPurchaseRow = {
  label: string | null;
  sales: number;
  purchase: number;
};

type Props = {
  data?: SalesPurchaseRow[] | null;
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
 * ✅ Normalize API data properly
 */
function normalizeData(data?: SalesPurchaseRow[] | null) {
  if (!Array.isArray(data)) return [];

  return data
    .map((item, index) => ({
      month:
        item.label && MONTH_ORDER.includes(item.label)
          ? item.label
          : `M${index + 1}`, // fallback if null
      sales: toNumber(item.sales),
      purchase: toNumber(item.purchase),
    }))
    .sort(
      (a, b) =>
        MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month)
    ); // 🔥 fix order
}

/**
 * ✅ Ensure UI doesn't break with less data
 */
function ensureMinimumMonths(data: any[]) {
  if (data.length >= 3) return data;

  const fallback = ["Jan", "Feb", "Mar"];

  return fallback.map((m) => {
    const found = data.find((d) => d.month === m);
    return found || { month: m, sales: 0, purchase: 0 };
  });
}

function getBarSize(length: number) {
  if (length <= 3) return 30;
  if (length <= 6) return 26;
  if (length <= 12) return 20;
  return 14;
}

/**
 * ✅ Tooltip UI (clean like design)
 */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border bg-white px-3 py-2 shadow-md">
      <p className="text-xs text-gray-500 mb-1">{label}</p>

      {payload.map((item: any) => (
        <div key={item.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-500">{item.name}:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SalesPurchaseTrendsChart({ data = [] }: Props) {
  const normalized = useMemo(() => normalizeData(data), [data]);

  const chartData = useMemo(
    () => ensureMinimumMonths(normalized),
    [normalized]
  );

  const barSize = useMemo(
    () => getBarSize(chartData.length),
    [chartData.length]
  );

  return (
    <DashboardCard title="Sales & Purchase Trends" className="h-full">
      
      {/* Chart */}
      <div className="h-[320px] w-full sm:h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barCategoryGap={20}
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
            <Tooltip content={<CustomTooltip />} />

            {/* Sales */}
            <Bar
              dataKey="sales"
              name="Sales"
              fill="#22C55E"
              radius={[6, 6, 0, 0]}
              barSize={barSize}
              activeBar={<Rectangle radius={6} />}
            />

            {/* Purchase */}
            <Bar
              dataKey="purchase"
              name="Purchase"
              fill="#EF4444"
              radius={[6, 6, 0, 0]}
              barSize={barSize}
              activeBar={<Rectangle radius={6} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ Bottom Legend */}
      <div className="mt-3 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-sm" />
          Sales
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-sm" />
          Purchase
        </div>
      </div>
    </DashboardCard>
  );
}