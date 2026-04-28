"use client";

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
import DashboardShellCard from "./DashboardShellCard";

type SalesTrendItem = {
  day?: string;
  date?: string;
  sales_count?: number;
};

type Props = {
  data?: SalesTrendItem[];
};

const fallbackData = [
  { day: "Mon", sales_count: 45 },
  { day: "Tue", sales_count: 52 },
  { day: "Wed", sales_count: 48 },
  { day: "Thu", sales_count: 61 },
  { day: "Fri", sales_count: 75 },
  { day: "Sat", sales_count: 89 },
  { day: "Sun", sales_count: 65 },
];

function CustomLegend() {
  return (
    <div className="mt-2 flex items-center justify-center gap-2 text-[14px] font-medium text-[#3B82F6]">
      <span className="h-[12px] w-[12px] rounded-[2px] bg-[#3B82F6]" />
      <span>Sales Count</span>
    </div>
  );
}

export default function SalesTrendChart({ data = [] }: Props) {
  const source = data.length ? data : fallbackData;

  const chartData = source.map((item) => ({
    day: item.day || "",
    date: item.date || "",
    sales: Number(item.sales_count || 0),
  }));

  return (
    <DashboardShellCard
      title="Sales Trends"
      className="min-h-[384px]"
      bodyClassName="pt-6"
      action={
        <button
          type="button"
          className="flex h-[31px] items-center gap-2 rounded-[11px] bg-white px-3 text-[13px] font-medium text-[#111827] shadow-[1px_1px_4px_0px_#0000001A]"
        >
          Weekly <span className="text-[13px] leading-none">⌄</span>
        </button>
      }
    >
      <div className="h-[292px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 18, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#D9D9D9"
              strokeDasharray="4 4"
              vertical
            />

            <XAxis
              dataKey="day"
              tick={{ fill: "#7A7A7A", fontSize: 13 }}
              axisLine={{ stroke: "#8C8C8C" }}
              tickLine={false}
            />

            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tick={{ fill: "#7A7A7A", fontSize: 13 }}
              axisLine={{ stroke: "#8C8C8C" }}
              tickLine={false}
            />

            <Tooltip
              cursor={{ fill: "rgba(59,130,246,0.06)" }}
              formatter={(value: number) => [`${value}`, "Sales Count"]}
            />

            <Legend content={<CustomLegend />} />

            <Bar
              dataKey="sales"
              fill="#3B82F6"
              radius={[9, 9, 0, 0]}
              barSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardShellCard>
  );
}