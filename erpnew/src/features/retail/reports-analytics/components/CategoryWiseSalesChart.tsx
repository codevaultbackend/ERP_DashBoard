"use client";

import { memo, useMemo } from "react";
import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategorySalesRow } from "../types";
import { cleanLabel, formatINR, safeNumber } from "../utils";
import ReportCard from "./ReportCard";
import SectionHeader from "./SectionHeader";

const PIE_COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#14B8A6",
  "#6366F1",
];

function CategoryTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;

  return (
    <div className="rounded-erp-xs border border-erp-border bg-erp-card px-4 py-3 shadow-erp-card">
      <p className="text-[13px] font-extrabold text-erp-heading">{row.name}</p>
      <p className="mt-1 text-[12px] font-semibold text-erp-muted">
        Revenue: <span className="text-erp-heading">{formatINR(row.value)}</span>
      </p>
      <p className="mt-0.5 text-[12px] font-semibold text-erp-muted">
        Share: <span className="text-erp-heading">{row.percentage}%</span>
      </p>
    </div>
  );
}

function CategoryLabel(props: any) {
  const { cx, cy, midAngle, outerRadius, name, percentage, fill } = props;

  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof outerRadius !== "number"
  ) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 26;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={fill || "var(--color-erp-muted)"}
      fontSize={11}
      fontWeight={700}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name} ${percentage}%`}
    </text>
  );
}

function CategoryWiseSalesChart({ data = [] }: { data?: CategorySalesRow[] }) {
  const chartData = useMemo(() => {
    const rows = data
      .map((item, index) => ({
        name: cleanLabel(item.category || item.label, `Category ${index + 1}`),
        value: safeNumber(item.revenue ?? item.value),
        percentage: safeNumber(item.percentage),
        fill: PIE_COLORS[index % PIE_COLORS.length],
      }))
      .filter((item) => item.value > 0);

    const total = rows.reduce((sum, item) => sum + item.value, 0);

    return rows.map((item) => ({
      ...item,
      percentage:
        item.percentage || (total > 0 ? Math.round((item.value / total) * 100) : 0),
    }));
  }, [data]);

  return (
    <ReportCard>
      <SectionHeader
        icon={<PieChartIcon className="h-5 w-5 text-erp-primary" />}
        title="Category-wise Sales"
        subtitle="Revenue distribution by product category"
        className="bg-[#F7F5FF]"
      />

      <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
        <div className="h-[300px] w-full sm:h-[325px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 22, right: 44, bottom: 22, left: 44 }}>
              <Tooltip content={<CategoryTooltip />} />

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={92}
                paddingAngle={0}
                stroke="none"
                label={<CategoryLabel />}
                labelLine={false}
                isAnimationActive={false}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ReportCard>
  );
}

export default memo(CategoryWiseSalesChart);