"use client";

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
import { salesPurchaseTrendData } from "../data/retail-dashboard-data";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-[#E7E9EE] bg-white px-3 py-2 shadow-[0px_10px_25px_rgba(17,24,39,0.08)]">
      <p className="mb-2 text-xs font-semibold text-[#111827]">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[#6B7280]">{item.name}:</span>
            <span className="font-semibold text-[#111827]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SalesPurchaseTrendsChart() {
  return (
    <DashboardCard
      title="Sales & Purchase Trends"
      action={
        <button
          type="button"
          className="flex h-[36px] items-center rounded-[12px] border border-[#ECEEF2] bg-white px-3 text-[14px] font-medium text-[#4B5563] shadow-sm"
        >
          Monthly
          <svg
            className="ml-2 h-4 w-4 text-[#6B7280]"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M6 8L10 12L14 8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      }
      className="h-full"
    >
      <div className="h-[300px] w-full sm:h-[330px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={salesPurchaseTrendData}
            barCategoryGap={20}
            margin={{ top: 6, right: 12, left: 0, bottom: 26 }}
          >
            <CartesianGrid
              stroke="#D6D9DF"
              strokeDasharray="4 4"
              vertical
              horizontal
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: "#A7AFBC", strokeWidth: 1 }}
              tick={{ fill: "#6B7280", fontSize: 14 }}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false}
              axisLine={{ stroke: "#A7AFBC", strokeWidth: 1 }}
              tick={{ fill: "#6B7280", fontSize: 14 }}
              width={42}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
            <Bar
              dataKey="sales"
              name="Sales"
              fill="#18C548"
              radius={[10, 10, 10, 10]}
              barSize={34}
              activeBar={<Rectangle radius={10} />}
            />
            <Bar
              dataKey="purchase"
              name="Purchase"
              fill="#FF4D39"
              radius={[10, 10, 10, 10]}
              barSize={34}
              activeBar={<Rectangle radius={10} />}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 pb-1">
        <span className="h-[12px] w-[12px] rounded-[2px] bg-[#3B82F6]" />
        <span className="text-[14px] font-medium text-[#3B82F6]">
          Sales Count
        </span>
      </div>
    </DashboardCard>
  );
}