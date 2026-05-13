"use client";

import Link from "next/link";
import type { HeadLedgerStoreRow } from "./types";

type Props = {
  rows: HeadLedgerStoreRow[];
};

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function getSafeStoreCode(row: HeadLedgerStoreRow & any) {
  return (
    row?.storeCode ||
    row?.store_code ||
    row?.code ||
    row?.raw?.store_code ||
    row?.raw?.storeCode ||
    ""
  );
}

function getViewHref(row: HeadLedgerStoreRow & any) {
  const storeCode = getSafeStoreCode(row);

  if (!storeCode) return "#";

  return `/head-office/ledger/${encodeURIComponent(String(storeCode))}`;
}

export default function HeadLedgerStoreTable({ rows }: Props) {
  const safeRows = rows || [];

  return (
    <>
      <div className="hidden overflow-hidden rounded-[30px] border border-[#E5E7EB] bg-white shadow-[1px_1px_4px_0px_rgba(0,0,0,0.10)] lg:block xl:rounded-[34px]">
        <div className="max-h-[calc(100vh-360px)] min-h-[420px] overflow-auto dashboard-hidden-scroll">
          <table className="w-full min-w-[1180px] table-fixed border-separate border-spacing-0 font-erp">
            <colgroup>
              <col className="w-[15.2%]" />
              <col className="w-[15.1%]" />
              <col className="w-[11.7%]" />
              <col className="w-[14.9%]" />
              <col className="w-[17.1%]" />
              <col className="w-[16.2%]" />
              <col className="w-[9.8%]" />
            </colgroup>

            <thead className="sticky top-0 z-10">
              <tr className="h-[58px] bg-black text-white xl:h-[64px]">
                {[
                  "Store Code",
                  "Store Manager",
                  "Total Deals",
                  "Total Amount",
                  "Received Amount",
                  "Pending Amount",
                  "Action",
                ].map((header, index) => (
                  <th
                    key={header}
                    className={[
                      "border-b border-black px-4 text-center align-middle text-[15px] font-semibold leading-[20px] tracking-[-0.03em] xl:text-[16px]",
                      index === 0 ? "rounded-tl-[30px] xl:rounded-tl-[34px]" : "",
                      index === 6 ? "rounded-tr-[30px] xl:rounded-tr-[34px]" : "",
                    ].join(" ")}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {safeRows.length > 0 ? (
                safeRows.map((row: HeadLedgerStoreRow & any, index) => {
                  const storeCode = getSafeStoreCode(row);
                  const rowKey = `${storeCode || "store"}-${index}`;

                  return (
                    <tr
                      key={rowKey}
                      className="h-[58px] bg-white transition hover:bg-[#FAFAFB] xl:h-[64px]"
                    >
                      <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[15px] font-normal leading-[20px] tracking-[-0.03em] text-[#30323A] xl:text-[16px]">
                        {formatValue(storeCode)}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[15px] font-normal leading-[20px] tracking-[-0.03em] text-[#30323A] xl:text-[16px]">
                        {formatValue(row.storeManager)}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[15px] font-normal leading-[20px] tracking-[-0.03em] text-[#30323A] xl:text-[16px]">
                        {formatValue(row.totalDeals)}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[15px] font-semibold leading-[20px] tracking-[-0.03em] text-[#101828] xl:text-[16px]">
                        {formatValue(row.totalAmount)}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[15px] font-semibold leading-[20px] tracking-[-0.03em] text-[#101828] xl:text-[16px]">
                        {formatValue(row.receivedAmount)}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[15px] font-semibold leading-[20px] tracking-[-0.03em] text-[#101828] xl:text-[16px]">
                        {formatValue(row.pendingAmount)}
                      </td>

                      <td className="border-b border-[#E5E7EB] px-4 text-center align-middle">
                        {storeCode ? (
                          <Link
                            href={getViewHref(row)}
                            className="text-[15px] font-medium leading-[20px] tracking-[-0.03em] text-[#2563EB] underline underline-offset-[3px] transition hover:text-[#1D4ED8] xl:text-[16px]"
                          >
                            View
                          </Link>
                        ) : (
                          <span className="text-[15px] font-medium text-[#98A2B3]">
                            View
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="h-[220px] px-5 text-center align-middle text-[15px] font-medium text-[#64748B]"
                  >
                    No ledger records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {safeRows.length > 0 ? (
          safeRows.map((row: HeadLedgerStoreRow & any, index) => {
            const storeCode = getSafeStoreCode(row);
            const rowKey = `${storeCode || "store-mobile"}-${index}`;

            return (
              <div
                key={rowKey}
                className="rounded-[26px] border border-[#E5E7EB] bg-white p-4 shadow-[1px_1px_4px_0px_rgba(0,0,0,0.10)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#667085]">
                      Store Code
                    </p>
                    <h3 className="mt-1 truncate text-[18px] font-semibold tracking-[-0.03em] text-[#101828]">
                      {formatValue(storeCode)}
                    </h3>
                  </div>

                  {storeCode ? (
                    <Link
                      href={getViewHref(row)}
                      className="shrink-0 text-[15px] font-semibold text-[#2563EB] underline underline-offset-[3px]"
                    >
                      View
                    </Link>
                  ) : (
                    <span className="shrink-0 text-[15px] font-semibold text-[#98A2B3]">
                      View
                    </span>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Info label="Store Manager" value={formatValue(row.storeManager)} />
                  <Info label="Total Deals" value={formatValue(row.totalDeals)} />
                  <Info label="Total Amount" value={formatValue(row.totalAmount)} />
                  <Info
                    label="Received Amount"
                    value={formatValue(row.receivedAmount)}
                  />
                  <Info
                    label="Pending Amount"
                    value={formatValue(row.pendingAmount)}
                  />
                  <Info
                    label="Level"
                    value={formatValue(row.organizationLevel)}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[26px] border border-[#E5E7EB] bg-white p-6 text-center text-[14px] font-medium text-[#64748B] shadow-[1px_1px_4px_0px_rgba(0,0,0,0.10)]">
            No ledger records found.
          </div>
        )}
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[#F8FAFC] p-3">
      <p className="text-[12px] font-medium leading-[16px] text-[#667085]">
        {label}
      </p>
      <p className="mt-1 break-words text-[14px] font-semibold leading-[19px] text-[#101828]">
        {value || "—"}
      </p>
    </div>
  );
}