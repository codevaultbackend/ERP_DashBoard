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

const headers = [
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
];

export default function CategoryTable(props: Props) {
  const getHref = (categoryId: string) => {
    if (props.scope === "district") {
      return `/head-office/store-management/${encodeURIComponent(
        props.districtId
      )}/categories/${encodeURIComponent(categoryId)}`;
    }

    return `/head-office/store-management/${encodeURIComponent(
      props.districtId
    )}/stores/${encodeURIComponent(props.storeId)}/categories/${encodeURIComponent(
      categoryId
    )}`;
  };

  if (props.rows.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-[26px] border border-erp-border bg-erp-card text-[15px] font-semibold text-erp-muted shadow-erp-card">
        No inventory data found.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[30px] border border-erp-border bg-erp-card shadow-erp-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-black">
                {headers.map((header, index) => (
                  <th
                    key={header}
                    className={[
                      "px-6 py-5 text-left text-[15px] font-semibold text-white",
                      index === 0 ? "rounded-tl-[30px]" : "",
                      index === headers.length - 1 ? "rounded-tr-[30px]" : "",
                      index >= 2 && index <= 8 ? "text-center" : "",
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
                  <td className="border-b border-r border-erp-border px-6 py-5 text-[15px] font-medium text-erp-text">
                    {row.name}
                  </td>
                  <td className="border-b border-r border-erp-border px-6 py-5 text-[15px] text-erp-muted">
                    {row.code}
                  </td>
                  <td className="border-b border-r border-erp-border px-6 py-5 text-center text-[15px] text-erp-text">
                    {row.quantity}
                  </td>
                  <td className="border-b border-r border-erp-border px-6 py-5 text-center text-[15px] font-semibold text-erp-text">
                    {row.sellingPrice}
                  </td>
                  <td className="border-b border-r border-erp-border px-6 py-5 text-center text-[15px] font-semibold text-erp-text">
                    {row.makingCharge}
                  </td>
                  <td className="border-b border-r border-erp-border px-6 py-5 text-center text-[15px] font-semibold text-erp-text">
                    {row.purity}
                  </td>
                  <td className="border-b border-r border-erp-border px-6 py-5 text-center text-[15px] font-semibold text-erp-text">
                    {row.netWt}
                  </td>
                  <td className="border-b border-r border-erp-border px-6 py-5 text-center text-[15px] font-semibold text-erp-text">
                    {row.stoneWt}
                  </td>
                  <td className="border-b border-r border-erp-border px-6 py-5 text-center text-[15px] font-semibold text-erp-text">
                    {row.grossWt}
                  </td>
                  <td className="border-b border-erp-border px-6 py-5 text-center">
                    <Link
                      href={getHref(row.id)}
                      className="text-[15px] font-semibold text-[#3B82F6] underline underline-offset-2"
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

      <div className="grid gap-4 md:hidden">
        {props.rows.map((row) => (
          <div
            key={row.id}
            className="rounded-[24px] border border-erp-border bg-erp-card p-4 shadow-erp-card"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-[18px] font-bold text-erp-text">
                  {row.name}
                </h3>
                <p className="mt-1 text-[14px] font-medium text-erp-muted">
                  {row.code}
                </p>
              </div>

              <Link
                href={getHref(row.id)}
                className="shrink-0 text-[14px] font-semibold text-[#3B82F6] underline underline-offset-2"
              >
                View
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <Info label="Qty" value={row.quantity} />
              <Info label="Selling Price" value={row.sellingPrice} />
              <Info label="Making Chg." value={row.makingCharge} />
              <Info label="Purity" value={row.purity} />
              <Info label="Net Wt." value={row.netWt} />
              <Info label="Gross Wt." value={row.grossWt} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] bg-erp-card-soft px-3 py-2">
      <p className="text-[12px] font-medium text-erp-muted">{label}</p>
      <p className="mt-1 truncate text-[14px] font-bold text-erp-text">
        {value}
      </p>
    </div>
  );
}