"use client";

import { memo, useMemo } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ReportCard from "./ReportCard";
import SectionHeader from "./SectionHeader";
import { formatCurrency, safeNumber } from "../utils";

const COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
];

function CategoryWiseSalesChart({ data = [] }: { data?: any[] }) {
  const finalData = useMemo(() => {
    const chartData = Array.isArray(data)
      ? data.map((item, index) => {
          const value =
            safeNumber(item.value) ||
            safeNumber(item.revenue) ||
            safeNumber(item.total_revenue) ||
            safeNumber(item.totalRevenue) ||
            safeNumber(item.percentage);

          const revenue =
            safeNumber(item.revenue) ||
            safeNumber(item.total_revenue) ||
            safeNumber(item.totalRevenue) ||
            value;

          return {
            name: item.name || item.label || item.category || "Unknown",
            value,
            revenue,
            percentage: safeNumber(item.percentage),
            color: item.color || COLORS[index % COLORS.length],
          };
        })
      : [];

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    return chartData.map((item) => ({
      ...item,
      percentage:
        item.percentage ||
        (total > 0 ? Math.round((item.value / total) * 100) : 0),
    }));
  }, [data]);

  const hasData = finalData.some((item) => safeNumber(item.value) > 0);

  const centerPercentage =
    finalData.length === 1
      ? finalData[0]?.percentage || 100
      : Math.min(
          finalData.reduce((sum, item) => sum + safeNumber(item.percentage), 0),
          100
        );

  return (
    <ReportCard>
      <SectionHeader
        icon={<PieChartIcon className="h-[18px] w-[18px] text-erp-primary" />}
        title="Category-wise Sales"
        subtitle="Revenue distribution by product category"
        className="bg-[#F5F3FF]"
      />

      <div className="min-w-0 overflow-hidden px-3 py-5 sm:px-4 sm:py-6">
        {hasData ? (
          <>
            <div className="relative mx-auto h-[220px] w-full max-w-[320px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%" debounce={80}>
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={finalData}
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="78%"
                    paddingAngle={finalData.length > 1 ? 2 : 0}
                    dataKey="value"
                    nameKey="name"
                    label={false}
                    labelLine={false}
                    isAnimationActive={false}
                  >
                    {finalData.map((entry, index) => (
                      <Cell key={`${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(v: any, _name: any, props: any) => {
                      const item = props?.payload;

                      return [
                        formatCurrency(Number(item?.revenue || v)),
                        `${item?.name || "Category"} (${item?.percentage || 0}%)`,
                      ];
                    }}
                    wrapperStyle={{ outline: "none" }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="max-w-[120px] text-center">
                  <p className="text-[22px] font-extrabold leading-none text-erp-dark sm:text-[26px]">
                    {centerPercentage}%
                  </p>

                  <p className="mt-2 truncate text-[13px] font-medium text-erp-muted sm:text-sm">
                    {finalData.length === 1 ? finalData[0]?.name : "Categories"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex min-w-0 flex-wrap items-center justify-center gap-x-4 gap-y-2 px-1 pb-1">
              {finalData.slice(0, 4).map((item) => (
                <div
                  key={item.name}
                  className="flex max-w-[150px] min-w-0 items-center gap-2 text-xs text-erp-muted"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />

                  <span className="truncate">
                    {item.name} {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex h-[260px] items-center justify-center text-[14px] font-medium text-erp-muted">
            No category sales data found
          </div>
        )}
      </div>
    </ReportCard>
  );
}

export default memo(CategoryWiseSalesChart);