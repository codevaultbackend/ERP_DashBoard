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
import SectionCard from "./SectionCard";
import { storePerformanceData } from "../../data/district-dashboard-data";

const CustomLegend = () => {
  return (
    <div className="mt-3 flex items-center justify-center gap-2 text-[12px] font-medium text-[#3B82F6] sm:mt-4 sm:text-[14px]">
      <span className="inline-block h-[10px] w-[10px] rounded-[2px] bg-[#3B82F6] sm:h-[12px] sm:w-[12px]" />
      <span>Revenue</span>
    </div>
  );
};

export default function StorePerformanceChart() {
  return (
    <SectionCard title="Store Performance" className="h-full">
      <div className="w-full overflow-x-auto">
        <div className="min-w-[760px] sm:min-w-[900px] lg:min-w-0">
          <div className="h-[260px] w-full sm:h-[300px] lg:h-[330px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={storePerformanceData}
                margin={{ top: 8, right: 8, left: 0, bottom: 12 }}
                barCategoryGap={8}
              >
                <CartesianGrid
                  stroke="#D1D5DB"
                  strokeDasharray="4 4"
                  vertical={true}
                  horizontal={true}
                />
                <XAxis
                  dataKey="name"
                  axisLine={{ stroke: "#707070", strokeWidth: 1 }}
                  tickLine={false}
                  tick={{ fill: "#707070", fontSize: 11 }}
                  interval={0}
                />
                <YAxis
                  domain={[0, 200]}
                  ticks={[0, 50, 100, 150, 200]}
                  axisLine={{ stroke: "#707070", strokeWidth: 1 }}
                  tickLine={false}
                  tick={{ fill: "#707070", fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value === 0) return "0";
                    if (value === 50) return "50L";
                    if (value === 100) return "1CR";
                    if (value === 150) return "1.5CR";
                    if (value === 200) return "2CR";
                    return `${value}`;
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(59,130,246,0.06)" }}
                  formatter={(value: number) => [`${value}L`, "Revenue"]}
                  contentStyle={{
                    borderRadius: 14,
                    border: "1px solid #E5E7EB",
                    boxShadow: "0px 10px 30px rgba(15,23,42,0.08)",
                  }}
                />
                <Legend content={<CustomLegend />} />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]} maxBarSize={36}>
                  {storePerformanceData.map((_, index) => (
                    <Cell key={index} fill="#3B82F6" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}