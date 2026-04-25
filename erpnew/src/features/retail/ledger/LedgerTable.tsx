"use client";

import Link from "next/link";
import { useMemo } from "react";
import { LedgerClientRow } from "../data/types";
import { getLedgerBasePathByRole } from "./role-path";

type Props = {
  rows: LedgerClientRow[];
  basePath?: string;
};

export default function LedgerTable({ rows, basePath }: Props) {
  const resolvedBasePath = useMemo(
    () => basePath || getLedgerBasePathByRole(),
    [basePath]
  );

  return (
    <>
      <div className="hidden overflow-hidden rounded-[28px] border border-[#E0E3E8] bg-white shadow-[0px_3px_14px_rgba(15,23,42,0.03)] lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-black text-white">
                {[
                  "Client Name",
                  "Total Deals",
                  "Total Amount",
                  "Received Amount",
                  "Pending Amount",
                  "Action",
                ].map((header, idx) => (
                  <th
                    key={header}
                    className={[
                      "border-b border-[#1D1D1D] px-6 py-5 text-center text-[14px] font-semibold",
                      idx === 0 ? "rounded-tl-[28px]" : "",
                      idx === 5 ? "rounded-tr-[28px]" : "",
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
                  <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-medium text-[#30323A]">
                    {row.clientName}
                  </td>
                  <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-medium text-[#30323A]">
                    {row.totalDeals}
                  </td>
                  <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-semibold text-[#1F2937]">
                    {row.totalAmount}
                  </td>
                  <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-semibold text-[#1F2937]">
                    {row.receivedAmount}
                  </td>
                  <td className="border-b border-r border-[#E5E7EB] px-6 py-5 text-center text-[16px] font-semibold text-[#1F2937]">
                    {row.pendingAmount}
                  </td>
                  <td className="border-b border-[#E5E7EB] px-6 py-5 text-center">
                    <Link
                      href={`${resolvedBasePath}/${row.id}`}
                      className="text-[16px] font-medium text-[#3B82F6] underline underline-offset-4"
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

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {rows.map((row) => (
          <div
            key={row.id}
            className="rounded-[24px] border border-[#E3E6EB] bg-white p-4 shadow-[0px_3px_12px_rgba(15,23,42,0.03)] sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[18px] font-semibold text-[#111827]">
                {row.clientName}
              </h3>
              <Link
                href={`${resolvedBasePath}/${row.id}`}
                className="text-[15px] font-medium text-[#3B82F6] underline underline-offset-4"
              >
                View
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-[16px] bg-[#F8F9FB] p-3">
                <p className="text-[12px] text-[#7B8496]">Total Deals</p>
                <p className="mt-1 text-[15px] font-semibold text-[#111827]">
                  {row.totalDeals}
                </p>
              </div>
              <div className="rounded-[16px] bg-[#F8F9FB] p-3">
                <p className="text-[12px] text-[#7B8496]">Total Amount</p>
                <p className="mt-1 text-[15px] font-semibold text-[#111827]">
                  {row.totalAmount}
                </p>
              </div>
              <div className="rounded-[16px] bg-[#F8F9FB] p-3">
                <p className="text-[12px] text-[#7B8496]">Received</p>
                <p className="mt-1 text-[15px] font-semibold text-[#111827]">
                  {row.receivedAmount}
                </p>
              </div>
              <div className="rounded-[16px] bg-[#F8F9FB] p-3">
                <p className="text-[12px] text-[#7B8496]">Pending</p>
                <p className="mt-1 text-[15px] font-semibold text-[#111827]">
                  {row.pendingAmount}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}