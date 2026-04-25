"use client";

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
import { monthlyRevenueTrendData } from "../data/retail-dashboard-data";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-[#E7E9EE] bg-white px-3 py-2 shadow-[0px_10px_25px_rgba(17,24,39,0.08)]">
      <p className="text-xs font-semibold text-[#111827]">{label}</p>
      <p className="mt-1 text-xs text-[#6B7280]">
        Revenue: <span className="font-semibold text-[#111827]">{payload[0].value}</span>
      </p>
    </div>
  );
}

export default function MonthlyRevenueTrendChart() {
  return (
    <DashboardCard title="Monthly Revenue Trend" className="h-full">
      <div className="h-[300px] w-full sm:h-[330px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyRevenueTrendData} margin={{ top: 8, right: 14, left: 0, bottom: 10 }}>
            <CartesianGrid stroke="#D6D9DF" strokeDasharray="4 4" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: "#A7AFBC", strokeWidth: 1 }}
              tick={{ fill: "#6B7280", fontSize: 14 }}
            />
            <YAxis
              domain={[0, 1000]}
              ticks={[0, 250, 500, 750, 1000]}
              tickLine={false}
              axisLine={{ stroke: "#A7AFBC", strokeWidth: 1 }}
              tick={{ fill: "#6B7280", fontSize: 14 }}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#2F80ED"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0, fill: "#2F80ED" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}