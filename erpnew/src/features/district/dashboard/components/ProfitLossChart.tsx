"use client";

import { useMemo } from "react";
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

type Props = {
  data: {
    month: string;
    amount: number;
  }[];
};

function formatAmount(value: number) {
  const num = Number(value || 0);

  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${Math.round(num / 1000)}K`;

  return String(num);
}

function formatCurrency(value: number) {
  return `₹${new Intl.NumberFormat("en-IN").format(Number(value || 0))}`;
}

export default function ProfitLossChart({ data }: Props) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      month: item.month || "-",
      value: Number(item.amount || 0),
    }));
  }, [data]);

  return (
    <SectionCard title="Profit and Loss" className="h-full">
      {chartData.length === 0 ? (
        <div className="flex h-[330px] items-center justify-center rounded-[24px] bg-[#F8FAFC] text-sm text-[#71717A]">
          No profit and loss data found.
        </div>
      ) : (
        <div className="h-[330px] w-full shadow-[1px_1px_4px_0px_#0000001A] border-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 8, right: 14, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="#D9D9D9" strokeDasharray="4 4" />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={{ stroke: "#707070" }}
                tick={{ fill: "#707070", fontSize: 12 }}
              />

              <YAxis
                width={58}
                tickLine={false}
                axisLine={{ stroke: "#707070" }}
                tick={{ fill: "#707070", fontSize: 12 }}
                tickFormatter={(value) => formatAmount(Number(value))}
              />

              <Tooltip
                formatter={(value: number) => [formatCurrency(value), "Amount"]}
                contentStyle={{
                  borderRadius: 14,
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                }}
              />

              <Line
                type="monotone"
                dataKey="value"
                stroke="#FF1F1F"
                strokeWidth={2.5}
                dot={chartData.length <= 40}
                activeDot={{ r: 5 }}
                isAnimationActive={chartData.length <= 80}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </SectionCard>
  );
}