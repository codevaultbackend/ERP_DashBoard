"use client";

import { memo } from "react";
import { Award } from "lucide-react";
import type { TopProductRow } from "../types";
import { cleanLabel, formatINR, safeNumber } from "../utils";
import ReportCard from "./ReportCard";
import SectionHeader from "./SectionHeader";

const rankClasses = [
  "bg-[#F5A800]",
  "bg-[#9CA3AF]",
  "bg-[#F97316]",
  "bg-erp-primary",
  "bg-erp-primary",
];

function TopProductsTable({ data = [] }: { data?: TopProductRow[] }) {
  const products = data.map((item, index) => ({
    rank: safeNumber(item.rank) || index + 1,
    name: cleanLabel(item.product_name || item.name, "Unnamed Product"),
    category: cleanLabel(item.category, "Uncategorized"),
    unitsSold: safeNumber(item.units_sold ?? item.unitsSold),
    totalRevenue: safeNumber(item.total_revenue ?? item.totalRevenue),
    performance: safeNumber(item.performance),
  }));

  return (
    <ReportCard>
      <SectionHeader
        icon={<Award className="h-5 w-5 text-erp-purple" />}
        title="Top Performing Products"
        subtitle="Best-selling items by revenue and quantity"
        className="bg-[#F8F5FF]"
      />

      <div className="hidden overflow-x-auto table-drag-scroll md:block">
        <div className="min-w-[980px] px-4 py-4 sm:px-5">
          <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-erp-sm">
            <thead>
              <tr className="bg-erp-card-soft">
                {[
                  "Rank",
                  "Product Name",
                  "Category",
                  "Units Sold",
                  "Total Revenue",
                  "Performance",
                ].map((heading) => (
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
              {products.map((product, index) => (
                <tr key={`${product.rank}-${product.name}`} className="bg-erp-card">
                  <td className="border-b border-erp-border px-5 py-[17px]">
                    <div
                      className={[
                        "flex h-[36px] w-[36px] items-center justify-center rounded-erp-full text-[13px] font-extrabold text-white",
                        rankClasses[index] || "bg-erp-primary",
                      ].join(" ")}
                    >
                      #{product.rank}
                    </div>
                  </td>

                  <td className="max-w-[330px] border-b border-erp-border px-5 py-[17px]">
                    <p className="truncate text-[15px] font-extrabold text-erp-heading">
                      {product.name}
                    </p>
                  </td>

                  <td className="border-b border-erp-border px-5 py-[17px]">
                    <span className="inline-flex max-w-[150px] truncate rounded-erp-xs bg-erp-purple-soft px-3 py-1 text-[12px] font-extrabold text-erp-purple">
                      {product.category}
                    </span>
                  </td>

                  <td className="border-b border-erp-border px-5 py-[17px] text-[15px] font-extrabold text-erp-text-soft">
                    {product.unitsSold}
                  </td>

                  <td className="border-b border-erp-border px-5 py-[17px] text-[15px] font-extrabold text-erp-success">
                    {formatINR(product.totalRevenue)}
                  </td>

                  <td className="border-b border-erp-border px-5 py-[17px]">
                    <div className="flex items-center gap-3">
                      <div className="h-[6px] w-[112px] overflow-hidden rounded-erp-full bg-erp-border">
                        <div
                          className="h-full rounded-erp-full bg-erp-success"
                          style={{
                            width: `${Math.min(100, Math.max(0, product.performance))}%`,
                          }}
                        />
                      </div>

                      <span className="text-[12px] font-extrabold text-erp-muted">
                        {product.performance}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
        {products.map((product, index) => (
          <div
            key={`${product.rank}-${product.name}`}
            className="rounded-erp-sm border border-erp-border bg-erp-card p-4 shadow-erp-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={[
                    "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-erp-full text-[12px] font-extrabold text-white",
                    rankClasses[index] || "bg-erp-primary",
                  ].join(" ")}
                >
                  #{product.rank}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-extrabold text-erp-heading">
                    {product.name}
                  </h3>

                  <span className="mt-2 inline-flex max-w-[150px] truncate rounded-erp-xs bg-erp-purple-soft px-2.5 py-1 text-[11px] font-extrabold text-erp-purple">
                    {product.category}
                  </span>
                </div>
              </div>

              <p className="shrink-0 text-[14px] font-extrabold text-erp-success">
                {formatINR(product.totalRevenue)}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-erp-xs bg-erp-card-soft p-3">
                <p className="text-[11px] text-erp-muted">Units Sold</p>
                <p className="mt-1 text-[14px] font-extrabold text-erp-heading">
                  {product.unitsSold}
                </p>
              </div>

              <div className="rounded-erp-xs bg-erp-card-soft p-3">
                <p className="text-[11px] text-erp-muted">Performance</p>
                <p className="mt-1 text-[14px] font-extrabold text-erp-heading">
                  {product.performance}%
                </p>
              </div>
            </div>

            <div className="mt-4 h-[6px] w-full overflow-hidden rounded-erp-full bg-erp-border">
              <div
                className="h-full rounded-erp-full bg-erp-success"
                style={{
                  width: `${Math.min(100, Math.max(0, product.performance))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

export default memo(TopProductsTable);