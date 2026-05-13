import { BadgeIndianRupee } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DistrictReportsData, ReportsPeriod } from "../types";
import { formatCompactCurrency, formatCurrency } from "../utils";
import EmptyState from "./EmptyState";

type CashVsAccountChartProps = {
  period: ReportsPeriod;
  data: DistrictReportsData["cashVsAccount"];
};

export default function CashVsAccountChart({
  period,
  data,
}: CashVsAccountChartProps) {
  const hasData = data.some(
    (item) => item.cash > 0 || item.pending > 0 || item.total > 0
  );

  return (
    <section className="mb-[18px] overflow-hidden rounded-[24px] border border-[#D9F1E8] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.035)]">
      <div className="flex flex-col gap-3 border-b border-[#D9F1E8] bg-[#EFFBF6] px-[22px] py-[18px] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BadgeIndianRupee className="h-[21px] w-[21px] text-[#059669]" />

            <h2 className="text-[18px] font-bold leading-[24px] tracking-[-0.03em] text-[#111827]">
              Cash vs Account Reconciliation
            </h2>
          </div>

          <p className="mt-[4px] text-[13px] font-normal leading-[18px] text-[#667085]">
            Daily reconciliation of cash and account transfers with total sales
          </p>
        </div>

        <span className="inline-flex h-[32px] w-fit items-center rounded-[10px] bg-white px-3 text-[12px] font-semibold capitalize text-[#344054] shadow-sm">
          {period}
        </span>
      </div>

      <div className="h-[350px] px-[18px] py-[22px] sm:px-[28px]">
        {data.length && hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 15, right: 10, left: 4, bottom: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E9EDF3"
              />

              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#98A2B3", fontSize: 12 }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#98A2B3", fontSize: 12 }}
                tickFormatter={(value) => formatCompactCurrency(value)}
              />

              <Tooltip
                cursor={{ fill: "rgba(47,128,237,0.08)" }}
                contentStyle={{
                  border: "1px solid #E4E7EC",
                  borderRadius: "14px",
                  boxShadow: "0 14px 35px rgba(16,24,40,0.12)",
                  fontSize: 12,
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "cash"
                    ? "Cash"
                    : name === "pending"
                    ? "Pending"
                    : "Total",
                ]}
                labelFormatter={(label) => `Day: ${label}`}
              />

              <Bar
                dataKey="total"
                radius={[7, 7, 0, 0]}
                fill="#2F80ED"
                barSize={38}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            label="No reconciliation data available"
            heightClass="h-full"
          />
        )}
      </div>
    </section>
  );
}