"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SectionCard from "./SectionCard";
import { profitLossData } from "../../data/district-dashboard-data";

export default function ProfitLossChart() {
  return (
    <SectionCard title="Profit and Loss" className="h-full">
      <div className="h-[330px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={profitLossData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#D1D5DB" strokeDasharray="4 4" />
            <XAxis
              dataKey="month"
              axisLine={{ stroke: "#707070", strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: "#707070", fontSize: 12 }}
            />
            <YAxis
              domain={[0, 1000]}
              ticks={[0, 250, 500, 750, 1000]}
              axisLine={{ stroke: "#707070", strokeWidth: 1 }}
              tickLine={false}
              tick={{ fill: "#707070", fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number) => [`${value}`, "Value"]}
              contentStyle={{
                borderRadius: 14,
                border: "1px solid #E5E7EB",
                boxShadow: "0px 10px 30px rgba(15,23,42,0.08)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#FF1F1F"
              strokeWidth={2.5}
              dot={{
                r: 3.5,
                fill: "#FFFFFF",
                stroke: "#FF1F1F",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 5,
                fill: "#FFFFFF",
                stroke: "#FF1F1F",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}