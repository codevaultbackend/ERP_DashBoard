"use client";

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
import DashboardShellCard from "./DashboardShellCard";

type SalesTrendItem = {
  day: string;
  date: string;
  sales_count: number;
};

type Props = {
  data?: SalesTrendItem[];
};

const CustomLegend = () => {
  return (
    <div className="mt-3 flex items-center justify-center gap-2 text-[14px] font-medium text-[#3B82F6]">
      <span className="inline-block h-[12px] w-[12px] rounded-[2px] bg-[#3B82F6]" />
      <span>Sales Count</span>
    </div>
  );
};

export default function SalesTrendChart({ data = [] }: Props) {
  const chartData = data.map((item) => ({
    day: item.day,
    date: item.date,
    sales: Number(item.sales_count || 0),
  }));

  const maxValue = Math.max(...chartData.map((item) => item.sales), 0);
  const yAxisMax = maxValue <= 5 ? 5 : Math.ceil(maxValue / 5) * 5;

  return (
    <DashboardShellCard
      title="Sales Trends"
      action={
        <button className="flex h-[34px] items-center gap-2 rounded-[12px] border border-[#E5E7EB] bg-white px-3 text-[14px] font-medium text-[#52525B] shadow-[0px_1px_2px_rgba(0,0,0,0.04)]">
          Weekly
          <span className="text-[12px]">⌄</span>
        </button>
      }
      className="shadow-[1px_1px_4px_0px_#0000001A]"
    >
      {chartData.length === 0 ? (
        <div className="flex h-[300px] min-w-0 items-center justify-center rounded-[22px] bg-[#F8FBFF] text-[15px] font-medium text-[#98A2B3] sm:h-[320px]">
          No sales trend data available
        </div>
      ) : (
        <div className="min-w-0">
          <div className="h-[300px] min-w-0 w-full sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 12, left: 0, bottom: 18 }}
              >
                <CartesianGrid
                  stroke="#D1D5DB"
                  strokeDasharray="4 4"
                  vertical={true}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                  axisLine={{ stroke: "#9CA3AF" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, yAxisMax]}
                  allowDecimals={false}
                  tick={{ fill: "#6B7280", fontSize: 13 }}
                  axisLine={{ stroke: "#9CA3AF" }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59,130,246,0.06)" }}
                  formatter={(value: number) => [`${value}`, "Sales Count"]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.date ? `${label} - ${item.date}` : label;
                  }}
                />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="sales" radius={[10, 10, 0, 0]} barSize={48}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#3B82F6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </DashboardShellCard>
  );
}