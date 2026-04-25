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
import { profitLossData } from "../data/retail-dashboard-data";

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

export default function ProfitLossChart() {
  return (
    <DashboardCard title="Profit and Loss" className="h-full">
      <div className="h-[320px] w-full sm:h-[340px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={profitLossData} margin={{ top: 8, right: 14, left: 0, bottom: 10 }}>
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
              dataKey="profit"
              name="Profit"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ r: 3.5, fill: "#FCFCFD", stroke: "#10B981", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#10B981", strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="loss"
              name="Loss"
              stroke="#FF1F1F"
              strokeWidth={3}
              dot={{ r: 3.5, fill: "#FCFCFD", stroke: "#FF1F1F", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#FF1F1F", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
}