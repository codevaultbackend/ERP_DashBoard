"use client";

import React from "react";
import { Gem } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SectionCard from "./SectionCard";
import { useResponsiveChart } from "../hooks/useResponsiveChart";
import { formatCurrency, formatCurrencyCompact } from "../utils";

type Row = {
  name: string;
  revenue: number;
  color: string;
};

function CustomBarLegend() {
  return (
    <div className="flex items-center justify-center gap-2 pt-3 text-[12px] text-[#111827] sm:pt-4 sm:text-[14px]">
      <span className="inline-block h-[10px] w-[10px] rounded-[2px] bg-black" />
      <span>Revenue (₹)</span>
    </div>
  );
}

type Props = {
  data: Row[];
};

export default function MetalTypeChart({ data }: Props) {
  const { metalBarSize } = useResponsiveChart();

  const maxValue = Math.max(1000, ...data.map((item) => item.revenue || 0));
  const yMax = Math.ceil(maxValue * 1.2);

  const ticks = [
    0,
    Math.round(yMax * 0.25),
    Math.round(yMax * 0.5),
    Math.round(yMax * 0.75),
    yMax,
  ];

  return (
    <SectionCard
      title="Metal Type Distribution"
      subtitle="Sales breakdown by metal purity"
      icon={<Gem className="h-5 w-5 text-[#F97316]" strokeWidth={2.2} />}
      headerClassName="bg-[#F7F1DF]"
      bodyClassName="px-2 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4 lg:px-5 lg:pb-5 lg:pt-5"
    >
      <div className="h-[300px] w-full sm:h-[360px] lg:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 14, right: 4, left: -12, bottom: 2 }}
            barSize={metalBarSize}
          >
            <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 4" vertical />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fill: "#6B7280", fontSize: 11 }}
            />
            <YAxis
              tickFormatter={formatCurrencyCompact}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 11 }}
              ticks={ticks}
              width={50}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              contentStyle={{
                borderRadius: 18,
                border: "1px solid #E5E7EB",
                boxShadow: "0px 12px 30px rgba(15,23,42,0.10)",
              }}
            />
            <Legend content={<CustomBarLegend />} />
            <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}