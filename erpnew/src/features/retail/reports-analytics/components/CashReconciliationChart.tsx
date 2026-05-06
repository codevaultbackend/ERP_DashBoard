"use client";

import React from "react";
import { IndianRupee } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import SectionCard from "./SectionCard";
import { formatCurrency, formatCurrencyCompact } from "../utils";
import { useResponsiveChart } from "../hooks/useResponsiveChart";

type Row = {
  label: string;
  cash: number;
  account: number;
  total: number;
};

type Props = {
  data?: Row[] | null;
};

const fallbackData: Row[] = [
  { label: "Mon", cash: 0, account: 0, total: 0 },
  { label: "Tue", cash: 0, account: 0, total: 0 },
  { label: "Wed", cash: 0, account: 0, total: 0 },
  { label: "Thu", cash: 0, account: 0, total: 0 },
  { label: "Fri", cash: 0, account: 0, total: 0 },
  { label: "Sat", cash: 0, account: 0, total: 0 },
  { label: "Sun", cash: 0, account: 0, total: 0 },
];

function toNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizeData(data?: Row[] | null): Row[] {
  if (!Array.isArray(data) || data.length === 0) {
    return fallbackData;
  }

  return data.map((item, index) => ({
    label: item?.label || `Day ${index + 1}`,
    cash: toNumber(item?.cash),
    account: toNumber(item?.account),
    total: toNumber(item?.total),
  }));
}

function ReconciliationTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: Row }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="rounded-[16px] border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0px_12px_30px_rgba(15,23,42,0.12)]">
      <div className="space-y-1 text-[14px] leading-[1.35] text-[#4B5563]">
        <p className="font-medium text-[#111827]">{label}</p>

        <p>
          Cash Received:{" "}
          <span className="font-semibold">{formatCurrency(row.cash)}</span>
        </p>

        <p>
          Account Transfer:{" "}
          <span className="font-semibold">{formatCurrency(row.account)}</span>
        </p>

        <p>
          Total Sales:{" "}
          <span className="font-semibold">{formatCurrency(row.total)}</span>
        </p>
      </div>
    </div>
  );
}

export default function CashReconciliationChart({ data }: Props) {
  const { barSize } = useResponsiveChart();

  const safeData = normalizeData(data);

  const maxValue = Math.max(
    1000,
    ...safeData.map((item) =>
      Math.max(toNumber(item.cash), toNumber(item.account), toNumber(item.total))
    )
  );

  const yMax = Math.ceil(maxValue * 1.25);

  const ticks = [
    0,
    Math.round(yMax * 0.25),
    Math.round(yMax * 0.5),
    Math.round(yMax * 0.75),
    yMax,
  ];

  return (
    <SectionCard
      title="Cash vs Account Reconciliation"
      subtitle="Daily reconciliation of cash and account transfers with total sales"
      icon={
        <IndianRupee
          className="h-5 w-5 text-[#059669]"
          strokeWidth={2.3}
        />
      }
      headerClassName="bg-[#E9F6F1]"
      action={
        <button
          type="button"
          className="inline-flex h-[38px] items-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[14px] font-medium text-[#4B5563] shadow-[0px_1px_2px_rgba(15,23,42,0.03)] transition hover:bg-[#F9FAFB]"
        >
          Daily
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            className="opacity-70"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      }
      bodyClassName="px-4 pb-3 pt-3 sm:px-5 sm:pb-4 lg:px-6 lg:pb-5"
    >
      <div className="h-[320px] w-full rounded-[20px] bg-[#FCFDFD] px-2 pt-3 sm:h-[360px] lg:h-[395px] lg:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={safeData}
            margin={{ top: 12, right: 4, left: -10, bottom: 10 }}
            barSize={barSize}
          >
            <CartesianGrid
              vertical={false}
              stroke="#E5E7EB"
              strokeDasharray="3 4"
            />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
            />

            <YAxis
              tickFormatter={formatCurrencyCompact}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#9CA3AF", fontSize: 12 }}
              domain={[0, yMax]}
              ticks={ticks}
              width={54}
            />

            <Tooltip
              cursor={{ fill: "rgba(17, 24, 39, 0.03)" }}
              content={<ReconciliationTooltip />}
            />

            <Bar
              dataKey="total"
              radius={[8, 8, 0, 0]}
              fill="#3B93E8"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}