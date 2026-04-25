"use client";

import Link from "next/link";
import type { CategoryItem } from "../store-management-data";

type Props =
  | {
      rows: CategoryItem[];
      scope: "district";
      districtId: string;
    }
  | {
      rows: CategoryItem[];
      scope: "store";
      districtId: string;
      storeId: string;
    };

export default function CategoryTable(props: Props) {
  const getHref = (categoryId: string) => {
    if (!props.districtId) return "#";

    if (props.scope === "district") {
      return `/head-office/store-management/${props.districtId}/categories/${categoryId}`;
    }

    if (!props.storeId) return "#";

    return `/head-office/store-management/${props.districtId}/stores/${props.storeId}/categories/${categoryId}`;
  };

  return (
    <div className="overflow-hidden rounded-[32px] border border-[#E5E7EB] bg-white shadow-[0px_4px_14px_rgba(15,23,42,0.035)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-black">
              {[
                "Category",
                "Code",
                "Quantity",
                "Selling Price",
                "Making Chg.",
                "Purity",
                "Net Wt.",
                "Stone Wt.",
                "Gross Wt.",
                "Action",
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
            {props.rows.map((row) => (
              <tr key={row.id} className="bg-white">
                <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-[16px] text-[#111827]">
                  {row.name}
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
                <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-medium text-[#111827]">
                  {row.grossWt}
                </td>
                <td className="border-b border-[#E5E7EB] px-6 py-5 text-center">
                  <Link
                    href={getHref(row.id)}
                    className="text-[16px] font-medium text-[#3B82F6] underline underline-offset-2"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}