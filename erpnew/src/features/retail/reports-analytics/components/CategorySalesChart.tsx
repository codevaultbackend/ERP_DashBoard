"use client";

import React from "react";
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

type Row = {
  name: string;
  value: number;
  percentage: number;
  color: string;
};

function PieLabel({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  name,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
  name?: string;
}) {
  if (
    cx === undefined ||
    cy === undefined ||
    midAngle === undefined ||
    outerRadius === undefined ||
    percent === undefined ||
    !name
  ) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

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

type Props = {
  data: Row[];
};

export default function CategorySalesChart({ data }: Props) {
  const { pieOuterRadius, isMobile } = useResponsiveChart();

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
          <RechartsPieChart margin={{ top: 10, right: 18, left: 18, bottom: 10 }}>
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              contentStyle={{
                borderRadius: 18,
                border: "1px solid #E5E7EB",
                boxShadow: "0px 12px 30px rgba(15,23,42,0.10)",
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="53%"
              outerRadius={pieOuterRadius}
              paddingAngle={1}
              dataKey="value"
              labelLine={false}
              label={isMobile ? false : PieLabel}
              stroke="white"
              strokeWidth={1}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}