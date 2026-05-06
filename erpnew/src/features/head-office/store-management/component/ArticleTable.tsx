"use client";

import Image from "next/image";
import type { ArticleItem } from "../store-management-data";

type Props = {
  rows: ArticleItem[];
};

const headers = [
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
];

export default function ArticleTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-[26px] border border-erp-border bg-erp-card text-[15px] font-semibold text-erp-muted shadow-erp-card">
        No article data found.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-[30px] border border-erp-border bg-erp-card shadow-erp-card md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-black">
                {headers.map((header, index) => (
                  <th
                    key={header}
                    className={[
                      "px-6 py-5 text-left text-[15px] font-semibold text-white",
                      index === 0 ? "rounded-tl-[30px]" : "",
                      index === headers.length - 1 ? "rounded-tr-[30px]" : "",
                      index >= 3 ? "text-center" : "",
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
                  <td className="border-b border-r border-erp-border px-6 py-3">
                    <div className="relative h-[46px] w-[86px] overflow-hidden rounded-[12px] bg-erp-card-soft">
                      <Image
                        src={row.image}
                        alt={row.article}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>

                  <td className="border-b border-r border-erp-border px-6 py-5 text-[15px] font-medium text-erp-text">
                    {row.article}
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

                  <td className="border-b border-erp-border px-6 py-5 text-center text-[15px] font-semibold text-erp-text">
                    {row.grossWt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-[24px] border border-erp-border bg-erp-card p-4 shadow-erp-card"
          >
            <div className="flex gap-4">
              <div className="relative h-[70px] w-[86px] shrink-0 overflow-hidden rounded-[16px] bg-erp-card-soft">
                <Image
                  src={row.image}
                  alt={row.article}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-[18px] font-bold text-erp-text">
                  {row.article}
                </h3>

                <p className="mt-1 text-[14px] font-medium text-erp-muted">
                  {row.code}
                </p>

                <p className="mt-2 text-[15px] font-bold text-erp-text">
                  {row.sellingPrice}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
              <Info label="Qty" value={row.quantity} />
              <Info label="Making Chg." value={row.makingCharge} />
              <Info label="Purity" value={row.purity} />
              <Info label="Net Wt." value={row.netWt} />
              <Info label="Stone Wt." value={row.stoneWt} />
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