import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DistrictReportsData } from "../types";
import {
  formatCompactCurrency,
  formatCurrency,
  getMetalTypeColor,
} from "../utils";
import ChartCard from "./ChartCard";
import EmptyState from "./EmptyState";

type MetalTypeDistributionChartProps = {
  data: DistrictReportsData["typeDistribution"];
};

export default function MetalTypeDistributionChart({
  data,
}: MetalTypeDistributionChartProps) {
  const chartData = data.filter((item) => item.revenue > 0);

  return (
    <ChartCard
      title="Metal Type Distribution"
      subtitle="Sales breakdown by metal purity"
      icon={<BarChart3 className="h-[20px] w-[20px]" />}
      iconClass="text-[#F97316]"
      headerClass="bg-[#FFF9E8]"
    >
      <div className="h-[320px]">
        {chartData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: 4, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E9EDF3" />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: "#D0D5DD" }}
                tick={{ fill: "#667085", fontSize: 12 }}
              />

              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#D0D5DD" }}
                tick={{ fill: "#667085", fontSize: 12 }}
                tickFormatter={(value) => formatCompactCurrency(value)}
              />

              <Tooltip
                contentStyle={{
                  border: "1px solid #E4E7EC",
                  borderRadius: "14px",
                  boxShadow: "0 14px 35px rgba(16,24,40,0.12)",
                  fontSize: 12,
                }}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
              />

              <Bar dataKey="revenue" radius={[7, 7, 0, 0]} barSize={48}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={getMetalTypeColor(index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            label="No metal type distribution available"
            heightClass="h-full"
          />
        )}
      </div>
    </ChartCard>
  );
}