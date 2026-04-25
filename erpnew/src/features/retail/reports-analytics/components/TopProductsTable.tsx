"use client";

import React from "react";
import { Medal } from "lucide-react";
import SectionCard from "./SectionCard";

type ProductRow = {
  rank: number;
  name: string;
  category: string;
  unitsSold: number;
  totalRevenue: string;
  performance: number;
  rankColor: string;
  tagClassName: string;
};

type Props = {
  products: ProductRow[];
};

export default function TopProductsTable({ products }: Props) {
  return (
    <SectionCard
      title="Top Performing Products"
      subtitle="Best-selling items by revenue and quantity"
      icon={<Medal className="h-5 w-5 text-[#6366F1]" strokeWidth={2.2} />}
      headerClassName="bg-[#F4EFFB]"
      bodyClassName="overflow-hidden"
    >
      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[920px]">
          <table className="w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#FAFAFA]">
                <th className="border-b border-[#E5E7EB] px-5 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  Rank
                </th>
                <th className="border-b border-[#E5E7EB] px-5 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  Product Name
                </th>
                <th className="border-b border-[#E5E7EB] px-5 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  Category
                </th>
                <th className="border-b border-[#E5E7EB] px-5 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  Units Sold
                </th>
                <th className="border-b border-[#E5E7EB] px-5 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  Total Revenue
                </th>
                <th className="border-b border-[#E5E7EB] px-5 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  Performance
                </th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={`${product.rank}-${product.name}`} className="bg-white">
                  <td className="border-b border-[#E5E7EB] px-5 py-4">
                    <div
                      className={[
                        "flex h-[40px] w-[40px] items-center justify-center rounded-full text-[16px] font-semibold text-white",
                        product.rankColor,
                      ].join(" ")}
                    >
                      #{product.rank}
                    </div>
                  </td>

                  <td className="border-b border-[#E5E7EB] px-5 py-4 text-[16px] font-semibold text-[#111827]">
                    {product.name}
                  </td>

                  <td className="border-b border-[#E5E7EB] px-5 py-4">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-[12px] font-semibold",
                        product.tagClassName,
                      ].join(" ")}
                    >
                      {product.category}
                    </span>
                  </td>

                  <td className="border-b border-[#E5E7EB] px-5 py-4 text-[15px] font-semibold text-[#374151]">
                    {product.unitsSold}
                  </td>

                  <td className="border-b border-[#E5E7EB] px-5 py-4 text-[15px] font-semibold text-[#16A34A]">
                    {product.totalRevenue}
                  </td>

                  <td className="border-b border-[#E5E7EB] px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-[8px] w-[120px] overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-full rounded-full bg-[#22C55E]"
                          style={{ width: `${product.performance}%` }}
                        />
                      </div>
                      <span className="text-[14px] font-semibold text-[#6B7280]">
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

      <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
        {products.map((product) => (
          <div
            key={`${product.rank}-${product.name}`}
            className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 shadow-[0px_4px_16px_rgba(15,23,42,0.03)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={[
                    "flex h-[36px] w-[36px] items-center justify-center rounded-full text-[14px] font-semibold text-white",
                    product.rankColor,
                  ].join(" ")}
                >
                  #{product.rank}
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-[#111827]">
                    {product.name}
                  </h3>
                  <span
                    className={[
                      "mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      product.tagClassName,
                    ].join(" ")}
                  >
                    {product.category}
                  </span>
                </div>
              </div>

              <p className="text-[14px] font-semibold text-[#16A34A]">
                {product.totalRevenue}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-[12px] bg-[#F9FAFB] p-3">
                <p className="text-[11px] text-[#6B7280]">Units Sold</p>
                <p className="mt-1 text-[14px] font-semibold text-[#111827]">
                  {product.unitsSold}
                </p>
              </div>

              <div className="rounded-[12px] bg-[#F9FAFB] p-3">
                <p className="text-[11px] text-[#6B7280]">Performance</p>
                <p className="mt-1 text-[14px] font-semibold text-[#111827]">
                  {product.performance}%
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-[8px] w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                <div
                  className="h-full rounded-full bg-[#22C55E]"
                  style={{ width: `${product.performance}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}