"use client";

import { memo, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import type { ReportsTrendRow } from "../types";
import { cleanLabel, formatDateLabel, formatINR, safeNumber } from "../utils";
import ReportCard from "./ReportCard";
import SectionHeader from "./SectionHeader";

function EmptyState() {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-erp-md bg-erp-card-soft text-[14px] font-semibold text-erp-muted">
      No daily sales trend found
    </div>
  );
}

function DailySalesTrendTable({ data = [] }: { data?: ReportsTrendRow[] }) {
  const rows = useMemo(() => {
    return data
      .map((item, index) => ({
        rank: index + 1,
        date: cleanLabel(item.label, "-"),
        displayDate: formatDateLabel(item.label),
        sales: safeNumber(item.sales ?? item.value),
      }))
      .filter((item) => item.sales > 0);
  }, [data]);

  const maxSales = Math.max(1, ...rows.map((item) => item.sales));

  return (
    <ReportCard>
      <SectionHeader
        icon={<TrendingUp className="h-5 w-5 text-erp-purple" />}
        title="Daily Sales Trend"
        subtitle="Date-wise sales performance from report API"
        className="bg-erp-purple-soft"
      />

      {rows.length ? (
        <>
          <div className="hidden overflow-x-auto table-drag-scroll md:block">
            <div className="min-w-[860px] px-4 py-4 sm:px-5">
              <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-erp-sm">
                <thead>
                  <tr className="bg-erp-card-soft">
                    {["Rank", "Date", "Sales", "Performance"].map((heading) => (
                      <th
                        key={heading}
                        className="border-b border-erp-border px-5 py-[16px] text-left text-[11px] font-extrabold uppercase tracking-[0.12em] text-erp-muted"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => {
                    const performance = Math.round((row.sales / maxSales) * 100);

                    return (
                      <tr key={`${row.rank}-${row.date}`} className="bg-erp-card">
                        <td className="border-b border-erp-border px-5 py-[17px]">
                          <div className="flex h-[36px] w-[36px] items-center justify-center rounded-erp-full bg-erp-primary text-[13px] font-extrabold text-white">
                            #{row.rank}
                          </div>
                        </td>

                        <td className="border-b border-erp-border px-5 py-[17px]">
                          <p className="text-[15px] font-extrabold text-erp-heading">
                            {row.displayDate}
                          </p>
                          <p className="mt-1 text-[12px] font-medium text-erp-muted">
                            {row.date}
                          </p>
                        </td>

                        <td className="border-b border-erp-border px-5 py-[17px] text-[15px] font-extrabold text-erp-success">
                          {formatINR(row.sales)}
                        </td>

                        <td className="border-b border-erp-border px-5 py-[17px]">
                          <div className="flex items-center gap-3">
                            <div className="h-[6px] w-[160px] overflow-hidden rounded-erp-full bg-erp-border">
                              <div
                                className="h-full rounded-erp-full bg-erp-success"
                                style={{ width: `${performance}%` }}
                              />
                            </div>

                            <span className="text-[12px] font-extrabold text-erp-muted">
                              {performance}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
            {rows.map((row) => {
              const performance = Math.round((row.sales / maxSales) * 100);

              return (
                <div
                  key={`${row.rank}-${row.date}`}
                  className="rounded-erp-sm border border-erp-border bg-erp-card p-4 shadow-erp-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-[34px] w-[34px] items-center justify-center rounded-erp-full bg-erp-primary text-[12px] font-extrabold text-white">
                        #{row.rank}
                      </div>

                      <div>
                        <h3 className="text-[14px] font-extrabold text-erp-heading">
                          {row.displayDate}
                        </h3>
                        <p className="mt-1 text-[12px] font-medium text-erp-muted">
                          {row.date}
                        </p>
                      </div>
                    </div>

                    <p className="text-[14px] font-extrabold text-erp-success">
                      {formatINR(row.sales)}
                    </p>
                  </div>

                  <div className="mt-4 h-[6px] w-full overflow-hidden rounded-erp-full bg-erp-border">
                    <div
                      className="h-full rounded-erp-full bg-erp-success"
                      style={{ width: `${performance}%` }}
                    />
                  </div>

                  <p className="mt-2 text-right text-[12px] font-extrabold text-erp-muted">
                    {performance}%
                  </p>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="p-4">
          <EmptyState />
        </div>
      )}
    </ReportCard>
  );
}

export default memo(DailySalesTrendTable);