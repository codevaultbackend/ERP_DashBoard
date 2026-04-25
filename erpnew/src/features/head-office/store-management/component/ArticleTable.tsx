"use client";

import Image from "next/image";
import type { ArticleItem } from "../store-management-data";

type Props = {
  rows: ArticleItem[];
};

export default function ArticleTable({ rows }: Props) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0px_4px_14px_rgba(15,23,42,0.035)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-black">
              {[
                "View Article",
                "Article",
                "Code",
                "Quantity",
                "Selling Price",
                "Making Chg.",
                "Purity",
                "Net Wt.",
                "Stone Wt.",
                "Gross Wt.",
              ].map((header, index, arr) => (
                <th
                  key={header}
                  className={[
                    "px-6 py-5 text-left text-[16px] font-semibold text-white",
                    index === 0 ? "rounded-tl-[32px]" : "",
                    index === arr.length - 1 ? "rounded-tr-[32px]" : "",
                  ].join(" ")}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="border-b border-r border-[#E5E7EB] px-6 py-3">
                  <div className="relative h-[42px] w-[84px] overflow-hidden rounded-[10px] bg-[#F3F4F6]">
                    <Image
                      src={row.image}
                      alt={row.article}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </td>
                <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-[16px] text-[#111827]">
                  {row.article}
                </td>
                <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-[16px] text-[#374151]">
                  {row.code}
                </td>
                <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] text-[#374151]">
                  {row.quantity}
                </td>
                <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-medium text-[#111827]">
                  {row.sellingPrice}
                </td>
                <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-medium text-[#111827]">
                  {row.makingCharge}
                </td>
                <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-medium text-[#111827]">
                  {row.purity}
                </td>
                <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-medium text-[#111827]">
                  {row.netWt}
                </td>
                <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-medium text-[#111827]">
                  {row.stoneWt}
                </td>
                <td className="border-b border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-medium text-[#111827]">
                  {row.grossWt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}