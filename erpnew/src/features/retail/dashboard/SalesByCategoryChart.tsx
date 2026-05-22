"use client";

import { useMemo } from "react";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import DashboardShellCard from "./DashboardShellCard";

type SalesCategoryItem = {
  category?: string;
  count?: number;
  percentage?: number;
};

type Props = {
  data?: SalesCategoryItem[];
  loading?: boolean;
};

type ChartItem = {
  name: string;
  value: number;
  count: number;
  percentage: number;
  color: string;
};

const COLORS = [
  "#3B82F6",
  "#18B985",
  "#F59E0B",
  "#EF4444",
  "#A855F7",
  "#06B6D4",
  "#F97316",
];

const MAX_VISIBLE_CATEGORIES = 4;

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload as ChartItem;

  return (
    <div className="rounded-[10px] border border-[#E5E7EB] bg-white px-3 py-2 shadow-[1px_1px_4px_0px_#0000001A]">
      <p className="text-[13px] font-semibold text-[#111827]">
        {item.name}
      </p>

      <p className="mt-1 text-[12px] text-[#64748B]">
        Count: {item.count} · {item.percentage}%
      </p>
    </div>
  );
}

function buildOptimizedChartData(
  data: SalesCategoryItem[]
): ChartItem[] {
  const cleanData = data
    .map((item) => ({
      name: item.category || "Other",
      count: Number(item.count || 0),
      rawPercentage: Number(item.percentage || 0),
    }))
    .filter(
      (item) =>
        item.count > 0 || item.rawPercentage > 0
    )
    .sort((a, b) => b.count - a.count);

  if (cleanData.length === 0) return [];

  const totalCount = cleanData.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const topItems = cleanData.slice(
    0,
    MAX_VISIBLE_CATEGORIES
  );

  const remainingItems = cleanData.slice(
    MAX_VISIBLE_CATEGORIES
  );

  const othersCount = remainingItems.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const finalItems =
    othersCount > 0
      ? [
          ...topItems,
          {
            name: "Others",
            count: othersCount,
            rawPercentage: 0,
          },
        ]
      : topItems;

  return finalItems.map((item, index) => {
    const percentage =
      totalCount > 0
        ? Number(
            ((item.count / totalCount) * 100).toFixed(0)
          )
        : Number(item.rawPercentage.toFixed(0));

    return {
      name: item.name,
      value: item.count || item.rawPercentage,
      count: item.count,
      percentage,
      color: COLORS[index % COLORS.length],
    };
  });
}

export default function SalesByCategoryChart({
  data = [],
  loading = false,
}: Props) {
  const chartData = useMemo(
    () => buildOptimizedChartData(data),
    [data]
  );

  const isSingleCategory = chartData.length === 1;

  return (
    <DashboardShellCard
      title="Sales by Category"
      className="h-auto min-h-[384px] overflow-hidden"
      bodyClassName="overflow-hidden pt-[18px] pb-[20px]"
    >
      {loading ? (
        <div className="flex h-[295px] items-center justify-center overflow-hidden">
          <div className="h-[205px] w-[205px] animate-pulse rounded-full bg-[#F1F5F9]" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex h-[295px] items-center justify-center text-[14px] font-medium text-[#94A3B8] overflow-hidden">
          No category data found
        </div>
      ) : (
        <div className="relative h-[260px] w-full overflow-hidden rounded-[24px] sm:h-[295px]">
          {isSingleCategory ? (
            <div
              className="absolute left-1/2 top-[6px] z-10 max-w-[180px] -translate-x-1/2 truncate text-center text-[12px] font-medium sm:top-[8px] sm:max-w-[220px] sm:text-[13px]"
              style={{
                color: chartData[0].color,
              }}
            >
              {chartData[0].name}{" "}
              {chartData[0].percentage}%
            </div>
          ) : null}

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart
              margin={{
                top: 10,
                right: 10,
                bottom: 10,
                left: 10,
              }}
            >
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius="72%"
                stroke="#FFFFFF"
                strokeWidth={1.5}
                paddingAngle={0}
                labelLine={false}
                isAnimationActive={
                  chartData.length <= 20
                }
                label={
                  isSingleCategory
                    ? false
                    : ({
                        name,
                        percentage,
                        x,
                        y,
                        cx,
                      }: any) => {
                        const safeY = Math.max(
                          20,
                          Math.min(y, 235)
                        );

                        return (
                          <text
                            x={x}
                            y={safeY}
                            fill="#111827"
                            textAnchor={
                              x > cx
                                ? "start"
                                : "end"
                            }
                            dominantBaseline="central"
                            style={{
                              fontSize:
                                window.innerWidth < 640
                                  ? 10
                                  : 12,
                              fontWeight: 500,
                            }}
                          >
                            {`${name} ${percentage}%`}
                          </text>
                        );
                      }
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`${entry.name}-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>

              <Tooltip
                content={<CustomTooltip />}
                cursor={false}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardShellCard>
  );
}