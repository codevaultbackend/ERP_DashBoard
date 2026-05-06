"use client";

import React, { useMemo } from "react";
import { PieChart } from "lucide-react";
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import SectionCard from "./SectionCard";
import { useResponsiveChart } from "../hooks/useResponsiveChart";
import { formatCurrency } from "../utils";

/* ---------- TYPES ---------- */
type Row = {
  name: string;
  value: number;
  percentage?: number;
  color: string;
};

type Props = {
  data: Row[];
};

/* ---------- SAFE LABEL ---------- */
function PieLabel(props: any) {
  const { cx, cy, midAngle, outerRadius, percent, name } = props;

  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof outerRadius !== "number" ||
    typeof percent !== "number" ||
    !name
  ) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 14;

  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // ❌ prevent label crash on tiny slices
  if (percent < 0.03) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#6B7280"
      fontSize={11}
      fontWeight={500}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${name} ${Math.round(percent * 100)}%`}
    </text>
  );
}

/* ---------- MAIN ---------- */
export default function CategorySalesChart({ data }: Props) {
  const { pieOuterRadius, isMobile } = useResponsiveChart();

  /* ---------- SANITIZE DATA (VERY IMPORTANT) ---------- */
  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => ({
        name: item?.name || "Unknown",
        value: Number(item?.value) || 0,
        color: item?.color || "#6366F1",
      }))
      .filter((item) => item.value > 0); // ❌ remove zero/invalid values
  }, [data]);

  return (
    <SectionCard
      title="Category-wise Sales"
      subtitle="Revenue distribution by product category"
      icon={<PieChart className="h-5 w-5 text-[#2563EB]" strokeWidth={2.2} />}
      headerClassName="bg-[#F3EEFD]"
      bodyClassName="px-2 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4 lg:px-5 lg:pb-5 lg:pt-5"
    >
      <div className="h-[300px] w-full sm:h-[360px] lg:h-[420px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart
            margin={{ top: 10, right: 18, left: 18, bottom: 10 }}
          >
            {/* ✅ TOOLTIP FIX */}
            <Tooltip
              formatter={(value: any, name: any) => [
                formatCurrency(Number(value) || 0),
                name,
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                boxShadow: "0px 10px 25px rgba(0,0,0,0.08)",
              }}
            />

            {/* ✅ PIE FIX */}
            <Pie
              data={safeData}
              cx="50%"
              cy="50%"
              outerRadius={pieOuterRadius}
              innerRadius={isMobile ? 40 : 55} 
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={isMobile ? false : PieLabel}
              isAnimationActive={false} 
              stroke="none" 
            >
              {safeData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke="none" 
                />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}