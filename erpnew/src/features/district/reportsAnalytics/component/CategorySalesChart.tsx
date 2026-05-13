import { PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DistrictReportsData } from "../types";
import { formatCurrency, getCategoryColor } from "../utils";
import ChartCard from "./ChartCard";
import EmptyState from "./EmptyState";

type CategorySalesChartProps = {
  data: DistrictReportsData["categorySales"];
};

export default function CategorySalesChart({ data }: CategorySalesChartProps) {
  const chartData = data
    .filter((item) => item.revenue > 0)
    .map((item, index) => ({
      name: item.category,
      value: item.revenue,
      percentage: item.percentage,
      fill: getCategoryColor(index),
    }));

  return (
    <ChartCard
      title="Category-wise Sales"
      subtitle="Revenue distribution by product category"
      icon={<PieChartIcon className="h-[20px] w-[20px]" />}
      iconClass="text-[#2563EB]"
      headerClass="bg-[#FBFAFF]"
    >
      <div className="h-[320px]">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={105}
                paddingAngle={0}
                dataKey="value"
                label={(entry) => `${entry.name} ${entry.percentage}%`}
                labelLine={false}
                fontSize={12}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  border: "1px solid #E4E7EC",
                  borderRadius: "14px",
                  boxShadow: "0 14px 35px rgba(16,24,40,0.12)",
                  fontSize: 12,
                }}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            label="No category sales data available"
            heightClass="h-full"
          />
        )}
      </div>
    </ChartCard>
  );
}