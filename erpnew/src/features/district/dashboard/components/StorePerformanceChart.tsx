"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SectionCard from "./SectionCard";

type Props = {
  data: {
    store_id: string;
    store_name: string;
    store_code: string;
    revenue: number;
  }[];
};

function shortText(value: string, max = 12) {
  if (!value) return "-";
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

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

const CustomLegend = () => (
  <div className="mt-3 flex items-center justify-center gap-2 text-[13px] font-medium text-[#3B82F6]">
    <span className="h-[11px] w-[11px] rounded-[2px] bg-[#3B82F6]" />
    Revenue
  </div>
);

export default function StorePerformanceChart({ data }: Props) {
  const chartData = useMemo(() => {
    return [...data]
      .filter((item) => item)
      .map((item, index) => ({
        name: shortText(item.store_name || `Store ${index + 1}`),
        fullName: item.store_name || `Store ${index + 1}`,
        code: item.store_code || "-",
        revenue: Number(item.revenue || 0),
      }));
  }, [data]);

  const chartMinWidth = Math.max(900, chartData.length * 72);

  return (
    <SectionCard title="Store Performance">
      {chartData.length === 0 ? (
        <div className="flex h-[350px] items-center justify-center rounded-[24px] bg-[#F8FAFC] text-sm text-[#71717A]">
          No store performance data found.
        </div>
      ) : (
        <div className="w-full overflow-x-auto overflow-y-hidden pb-1">
          <div style={{ minWidth: chartMinWidth }}>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 12 }}
                  barCategoryGap="28%"
                >
                  <CartesianGrid stroke="#D9D9D9" strokeDasharray="4 4" />

                  <XAxis
                    dataKey="name"
                    interval={0}
                    tickLine={false}
                    axisLine={{ stroke: "#707070" }}
                    tick={{ fill: "#707070", fontSize: 11 }}
                  />

                  <YAxis
                    width={54}
                    tickLine={false}
                    axisLine={{ stroke: "#707070" }}
                    tick={{ fill: "#707070", fontSize: 11 }}
                    tickFormatter={(value) => formatAmount(Number(value))}
                  />

                  <Tooltip
                    cursor={{ fill: "rgba(59,130,246,0.08)" }}
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Revenue",
                    ]}
                    labelFormatter={(_, payload) => {
                      const row = payload?.[0]?.payload;
                      return row ? `${row.fullName} (${row.code})` : "";
                    }}
                    contentStyle={{
                      borderRadius: 14,
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                    }}
                  />

                  <Legend content={<CustomLegend />} />

                  <Bar
                    dataKey="revenue"
                    fill="#3B82F6"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={38}
                    isAnimationActive={chartData.length <= 80}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}