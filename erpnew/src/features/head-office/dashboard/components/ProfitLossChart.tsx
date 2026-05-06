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

type ProfitLossRow = {
  label: string | null; // "2026-03"
  profit: number;
  loss: number;
};

type Props = {
  data?: ProfitLossRow[] | null;
};

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec"
];

function toNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

/**
 * ✅ Convert "2026-03" → "Mar"
 */
function formatMonth(label: string | null, index: number) {
  if (!label) return `M${index + 1}`;

  const parts = label.split("-");
  if (parts.length !== 2) return label;

  const monthIndex = Number(parts[1]) - 1;
  return MONTHS[monthIndex] || label;
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
 * ✅ Normalize + sort data
 */
function normalizeData(data?: ProfitLossRow[] | null) {
  if (!Array.isArray(data)) return [];

  return data
    .map((item, index) => ({
      raw: item.label,
      month: formatMonth(item.label, index),
      profit: toNumber(item.profit),
      loss: toNumber(item.loss),
    }))
    .sort((a, b) => {
      if (!a.raw || !b.raw) return 0;
      return new Date(a.raw).getTime() - new Date(b.raw).getTime();
    });
}

/**
 * ✅ Ensure minimum points (better UI spacing)
 */
function ensureMinimum(data: any[]) {
  if (data.length >= 4) return data;

  const fallback = ["Jan", "Feb", "Mar", "Apr"];

  return fallback.map((m) => {
    const found = data.find((d) => d.month === m);
    return found || { month: m, profit: 0, loss: 0 };
  });
}

export default function ProfitLossChart({ data = [] }: Props) {
  const normalized = useMemo(() => normalizeData(data), [data]);

  const chartData = useMemo(
    () => ensureMinimum(normalized),
    [normalized]
  );

  return (
    <DashboardCard title="Profit & Loss" className="h-full">

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
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;

                return (
                  <div className="rounded-xl border bg-white px-3 py-2 shadow-md">
                    <p className="text-xs text-gray-500 mb-1">{label}</p>

                    {payload.map((item: any) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2 text-sm"
                      >
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
              }}
            />

            {/* Profit Line */}
            <Line
              type="monotone"
              dataKey="profit"
              name="Profit"
              stroke="#22C55E"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />

            {/* Loss Line */}
            <Line
              type="monotone"
              dataKey="loss"
              name="Loss"
              stroke="#EF4444"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ✅ Legend */}
      <div className="mt-3 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-sm" />
          Profit
        </div>

        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-500 rounded-sm" />
          Loss
        </div>
      </div>

    </DashboardCard>
  );
}