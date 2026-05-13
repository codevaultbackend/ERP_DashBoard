"use client";

import Link from "next/link";
import type { HeadLedgerCustomerRow } from "./types";

type Props = {
  rows: HeadLedgerCustomerRow[];
};

function displayValue(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    value === "undefined" ||
    value === "null"
  ) {
    return "—";
  }

  return String(value);
}

export default function HeadLedgerCustomerTable({ rows }: Props) {
  return (
    <div className="w-full overflow-hidden rounded-[31px] border border-[#E5E7EB] bg-white shadow-[1px_1px_4px_0px_rgba(0,0,0,0.10)]">
      <div className="overflow-x-auto dashboard-hidden-scroll">
        <table className="w-full min-w-[1120px] table-fixed border-separate border-spacing-0 font-erp">
          <colgroup>
            <col className="w-[14.2%]" />
            <col className="w-[16.7%]" />
            <col className="w-[18.3%]" />
            <col className="w-[20.2%]" />
            <col className="w-[20.1%]" />
            <col className="w-[10.5%]" />
          </colgroup>

          <thead>
            <tr className="h-[58px] bg-black text-white">
              {[
                "Client Name",
                "Total Deals",
                "Total Amount",
                "Received Amount",
                "Pending Amount",
                "Action",
              ].map((header, index) => (
                <th
                  key={header}
                  className={[
                    "border-b border-black px-4 text-center align-middle",
                    "text-[16px] font-semibold leading-[20px] tracking-[-0.03em]",
                    index === 0 ? "rounded-tl-[31px]" : "",
                    index === 5 ? "rounded-tr-[31px]" : "",
                  ].join(" ")}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr
                  key={`${row.customerId}-${index}`}
                  className="h-[54px] bg-white transition hover:bg-[#F8FAFC]"
                >
                  <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[16px] font-normal leading-[20px] tracking-[-0.03em] text-[#30323A]">
                    {displayValue(row.clientName)}
                  </td>

                  <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[16px] font-normal leading-[20px] tracking-[-0.03em] text-[#30323A]">
                    {displayValue(row.totalDeals)}
                  </td>

                  <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[16px] font-semibold leading-[20px] tracking-[-0.03em] text-[#101828]">
                    {displayValue(row.totalAmount)}
                  </td>

                  <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[16px] font-semibold leading-[20px] tracking-[-0.03em] text-[#101828]">
                    {displayValue(row.receivedAmount)}
                  </td>

                  <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[16px] font-semibold leading-[20px] tracking-[-0.03em] text-[#101828]">
                    {displayValue(row.pendingAmount)}
                  </td>

                  <td className="border-b border-[#E5E7EB] px-4 text-center align-middle">
                    <Link
                      href={row.href}
                      className="text-[16px] font-medium leading-[20px] tracking-[-0.03em] text-[#2563EB] underline underline-offset-[3px] transition hover:text-[#1D4ED8]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="h-[190px] px-5 text-center align-middle text-[15px] font-medium text-[#64748B]"
                >
                  No customer ledger records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}