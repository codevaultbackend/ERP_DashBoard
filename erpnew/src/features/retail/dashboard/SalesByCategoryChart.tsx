"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import DashboardShellCard from "./DashboardShellCard";

type SalesCategoryItem = {
  category: string;
  count: number;
  percentage: number;
};

type Props = {
  data?: SalesCategoryItem[];
};

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#14B8A6",
  "#F97316",
  "#EC4899",
];

export default function SalesByCategoryChart({ data = [] }: Props) {
  const chartData = data.map((item, index) => ({
    name: item.category,
    value: Number(item.count || 0),
    percentage: Number(item.percentage || 0),
    color: COLORS[index % COLORS.length],
  }));

  return (
    <DashboardShellCard title="Sales by Category" className="shadow-[1px_1px_4px_0px_#0000001A]">
      {chartData.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center rounded-[22px] bg-[#F8FBFF] text-[15px] font-medium text-[#98A2B3] sm:h-[320px]">
          No category sales data available
        </div>
      ) : (
        <div className="relative h-[300px] w-full sm:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                stroke="#FFFFFF"
                strokeWidth={1.5}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, _name, item: any) => [
                  `${value}`,
                  `${item?.payload?.name} (${item?.payload?.percentage}%)`,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardShellCard>
  );
}