"use client";

import React from "react";
import { Medal } from "lucide-react";
import SectionCard from "./SectionCard";
import { formatCurrency } from "../utils";

type ProductRow = {
  rank?: number;
  id?: string | number;
  name?: string;
  product_name?: string;
  item_name?: string;
  category?: string;
  category_name?: string;
  unitsSold?: number;
  units_sold?: number;
  quantity?: number;
  qty?: number;
  sold_qty?: number;
  totalRevenue?: string | number;
  total_revenue?: string | number;
  amount?: string | number;
  revenue?: string | number;
  total?: string | number;
  performance?: number;
  rankColor?: string;
  tagClassName?: string;
};

type SafeProductRow = {
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
  products?: ProductRow[] | null;
  data?: ProductRow[] | null;
};

const rankColors = ["bg-[#F59E0B]", "bg-[#64748B]", "bg-[#A16207]", "bg-[#6366F1]"];

const tagClasses = [
  "bg-[#EFF6FF] text-[#2563EB]",
  "bg-[#ECFDF5] text-[#059669]",
  "bg-[#FFF7ED] text-[#EA580C]",
  "bg-[#F5F3FF] text-[#7C3AED]",
  "bg-[#FEF2F2] text-[#DC2626]",
];

const fallbackProducts: SafeProductRow[] = [
  {
    rank: 1,
    name: "No Products Found",
    category: "No Data",
    unitsSold: 0,
    totalRevenue: formatCurrency(0),
    performance: 0,
    rankColor: "bg-[#9CA3AF]",
    tagClassName: "bg-[#F3F4F6] text-[#6B7280]",
  },
];

function toNumber(value: unknown): number {
  if (typeof value === "string") {
    const cleaned = value.replace(/[₹,\s]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : 0;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function clampPerformance(value: unknown): number {
  const num = toNumber(value);
  if (num < 0) return 0;
  if (num > 100) return 100;
  return Math.round(num);
}

function normalizeProducts(products?: ProductRow[] | null): SafeProductRow[] {
  if (!Array.isArray(products) || products.length === 0) {
    return fallbackProducts;
  }

  const maxRevenue = Math.max(
    1,
    ...products.map((item) =>
      toNumber(
        item?.totalRevenue ??
          item?.total_revenue ??
          item?.amount ??
          item?.revenue ??
          item?.total
      )
    )
  );

  return products.map((item, index) => {
    const revenueValue = toNumber(
      item?.totalRevenue ??
        item?.total_revenue ??
        item?.amount ??
        item?.revenue ??
        item?.total
    );

    const performance =
      item?.performance !== undefined
        ? clampPerformance(item.performance)
        : clampPerformance((revenueValue / maxRevenue) * 100);

    return {
      rank: item?.rank || index + 1,
      name:
        item?.name ||
        item?.product_name ||
        item?.item_name ||
        "Unnamed Product",
      category: item?.category || item?.category_name || "Uncategorized",
      unitsSold: toNumber(
        item?.unitsSold ?? item?.units_sold ?? item?.quantity ?? item?.qty ?? item?.sold_qty
      ),
      totalRevenue:
        typeof item?.totalRevenue === "string" && item.totalRevenue.includes("₹")
          ? item.totalRevenue
          : formatCurrency(revenueValue),
      performance,
      rankColor: item?.rankColor || rankColors[index % rankColors.length],
      tagClassName: item?.tagClassName || tagClasses[index % tagClasses.length],
    };
  });
}

export default function TopProductsTable({ products, data }: Props) {
  const safeProducts = normalizeProducts(products ?? data);

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
                {["Rank", "Product Name", "Category", "Units Sold", "Total Revenue", "Performance"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="border-b border-[#E5E7EB] px-5 py-4 text-left text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {safeProducts.map((product) => (
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
        {safeProducts.map((product) => (
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