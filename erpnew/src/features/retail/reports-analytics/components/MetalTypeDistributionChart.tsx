"use client";

import { memo, useMemo } from "react";
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
import type { TypeDistributionRow } from "../types";
import {
  cleanLabel,
  formatAxisCurrency,
  formatINR,
  getNiceYAxis,
  safeNumber,
} from "../utils";
import ReportCard from "./ReportCard";
import SectionHeader from "./SectionHeader";

const METAL_COLORS = ["#F2A80D", "#F8C027", "#D1D5DB", "#9CA3AF", "#FB923C"];

function MetalTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;

  return (
    <div className="rounded-erp-xs border border-erp-border bg-erp-card px-4 py-3 shadow-erp-card">
      <p className="text-[13px] font-extrabold text-erp-heading">{row.name}</p>
      <p className="mt-1 text-[12px] font-semibold text-erp-muted">
        Revenue: <span className="text-erp-heading">{formatINR(row.value)}</span>
      </p>
    </div>
  );
}

function MetalTypeDistributionChart({
  data = [],
}: {
  data?: TypeDistributionRow[];
}) {
  const chartData = useMemo(() => {
    return data
      .map((item, index) => ({
        name: cleanLabel(item.label, `Metal ${index + 1}`),
        value: safeNumber(item.value),
        fill: METAL_COLORS[index % METAL_COLORS.length],
      }))
      .filter((item) => item.value > 0);
  }, [data]);

  const maxValue = Math.max(0, ...chartData.map((item) => item.value));
  const { yMax, ticks } = getNiceYAxis(maxValue);

  return (
    <ReportCard>
      <SectionHeader
        icon={<BarChart3 className="h-5 w-5 text-erp-warning" />}
        title="Metal Type Distribution"
        subtitle="Sales breakdown by metal purity"
        className="bg-[#FFFBEA]"
      />

      <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
        <div className="h-[300px] w-full sm:h-[325px]">
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={chartData}
              margin={{ top: 18, right: 18, bottom: 22, left: 8 }}
              barSize={56}
            >
              <CartesianGrid
                vertical
                stroke="var(--color-erp-border)"
                strokeDasharray="2 5"
              />

              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: "var(--color-erp-border)" }}
                interval={0}
                tick={{
                  fill: "var(--color-erp-muted)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />

              <YAxis
                tickFormatter={formatAxisCurrency}
                tickLine={false}
                axisLine={{ stroke: "var(--color-erp-border)" }}
                domain={[0, yMax]}
                ticks={ticks}
                width={66}
                tick={{
                  fill: "var(--color-erp-muted)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />

              <Tooltip cursor={{ fill: "transparent" }} content={<MetalTooltip />} />

              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-erp-heading">
              <span className="h-[8px] w-[12px] bg-erp-dark" />
              Revenue (₹)
            </div>
          </div>
        </div>
      </div>
    </ReportCard>
  );
}

export default memo(MetalTypeDistributionChart);