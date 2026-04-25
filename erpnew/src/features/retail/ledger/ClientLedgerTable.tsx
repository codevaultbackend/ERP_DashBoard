"use client";

import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Fragment, useState } from "react";
import { getPaymentsByInvoice } from "./api";
import { ClientInvoiceHistoryRow, ClientInvoiceRow } from "./types";
import { mapInvoiceHistoryToUi } from "./utils";

type Props = {
  rows: ClientInvoiceRow[];
  onViewInvoice: (invoice: ClientInvoiceRow) => void;
};

export default function ClientLedgerTable({ rows, onViewInvoice }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [historyMap, setHistoryMap] = useState<
    Record<string, ClientInvoiceHistoryRow[]>
  >({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  const handleToggleHistory = async (row: ClientInvoiceRow) => {
    const rowId = String(row.id);
    const isOpen = openId === rowId;

    if (isOpen) {
      setOpenId(null);
      return;
    }

    setOpenId(rowId);

    if (loadedMap[rowId]) return;

    try {
      setLoadingMap((prev) => ({ ...prev, [rowId]: true }));
      setErrorMap((prev) => ({ ...prev, [rowId]: "" }));

      const res = await getPaymentsByInvoice(row.invoiceId);

      if (!res?.success) {
        throw new Error(res?.message || "Failed to load payment history.");
      }

      const mapped = mapInvoiceHistoryToUi(res);

      setHistoryMap((prev) => ({
        ...prev,
        [rowId]: mapped,
      }));
      setLoadedMap((prev) => ({ ...prev, [rowId]: true }));
    } catch (error) {
      console.error("Failed to load invoice history:", error);

      setHistoryMap((prev) => ({
        ...prev,
        [rowId]: [],
      }));
      setLoadedMap((prev) => ({ ...prev, [rowId]: true }));
      setErrorMap((prev) => ({
        ...prev,
        [rowId]:
          error instanceof Error
            ? error.message
            : "Failed to load payment history.",
      }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [rowId]: false }));
    }
  };

  return (
    <>
      <div className="hidden overflow-hidden rounded-[28px] border border-[#E0E3E8] bg-white shadow-[0px_3px_14px_rgba(15,23,42,0.03)] lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-[1180px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-black text-white">
                {[
                  "Invoice Number",
                  "Date",
                  "Total Amount",
                  "Received Amount",
                  "Pending Amount",
                  "Payment Tracking",
                  "Action",
                ].map((header, idx) => (
                  <th
                    key={header}
                    className={[
                      "border-b border-[#1D1D1D] px-5 py-5 text-center text-[14px] font-semibold",
                      idx === 0 ? "rounded-tl-[28px]" : "",
                      idx === 6 ? "rounded-tr-[28px]" : "",
                    ].join(" ")}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => {
                const rowId = String(row.id);
                const isOpen = openId === rowId;
                const isLoading = !!loadingMap[rowId];
                const history = historyMap[rowId] ?? row.history ?? [];
                const error = errorMap[rowId] ?? "";

                return (
                  <Fragment key={rowId}>
                    <tr className="bg-white">
                      <td className="border-b border-r border-[#E5E7EB] px-5 py-5 text-center text-[16px] font-medium text-[#30323A]">
                        {row.invoiceNumber}
                      </td>
                      <td className="border-b border-r border-[#E5E7EB] px-5 py-5 text-center text-[16px] font-medium text-[#30323A]">
                        {row.date}
                      </td>
                      <td className="border-b border-r border-[#E5E7EB] px-5 py-5 text-center text-[16px] font-semibold text-[#1F2937]">
                        {row.totalAmount}
                      </td>
                      <td className="border-b border-r border-[#E5E7EB] px-5 py-5 text-center text-[16px] font-semibold text-[#1F2937]">
                        {row.receivedAmount}
                      </td>
                      <td className="border-b border-r border-[#E5E7EB] px-5 py-5 text-center text-[16px] font-semibold text-[#1F2937]">
                        {row.pendingAmount}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-5 py-5 text-center">
                        <button
                          onClick={() => handleToggleHistory(row)}
                          className="inline-flex items-center gap-2 text-[16px] font-medium text-[#1F2937]"
                        >
                          View History
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>

                      <td className="border-b border-[#E5E7EB] px-5 py-5 text-center">
                        <button
                          onClick={() => onViewInvoice(row)}
                          className="text-[16px] font-medium text-[#3B82F6] underline underline-offset-4"
                        >
                          View
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td
                          colSpan={7}
                          className="border-b border-[#E5E7EB] bg-[#F3F8FC] px-0 py-0"
                        >
                          <div className="grid grid-cols-6 border-t border-[#E5E7EB] bg-[#F6FAFD]">
                            <div className="border-r border-[#E5E7EB] px-5 py-4 text-center text-[15px] font-semibold text-[#1F2937]">
                              Date
                            </div>
                            <div className="border-r border-[#E5E7EB] px-5 py-4 text-center text-[15px] font-semibold text-[#1F2937]">
                              Received Amount
                            </div>
                            <div className="border-r border-[#E5E7EB] px-5 py-4 text-center text-[15px] font-semibold text-[#1F2937]">
                              Self/Financer
                            </div>
                            <div className="border-r border-[#E5E7EB] px-5 py-4 text-center text-[15px] font-semibold text-[#1F2937]">
                              Payment Method
                            </div>
                            <div className="border-r border-[#E5E7EB] px-5 py-4 text-center text-[15px] font-semibold text-[#1F2937]">
                              TXN ID
                            </div>
                            <div className="px-5 py-4 text-center text-[15px] font-semibold text-[#1F2937]">
                              Operator
                            </div>
                          </div>

                          {isLoading ? (
                            <div className="flex items-center justify-center gap-2 px-5 py-6 text-[15px] font-medium text-[#4B5563]">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading history...
                            </div>
                          ) : error ? (
                            <div className="px-5 py-6 text-center text-[15px] font-medium text-[#B42318]">
                              {error}
                            </div>
                          ) : history.length > 0 ? (
                            history.map((historyItem) => (
                              <div
                                key={historyItem.id}
                                className="grid grid-cols-6 border-t border-[#E5E7EB] bg-[#F3F8FC]"
                              >
                                <div className="border-r border-[#E5E7EB] px-5 py-5 text-center text-[16px] text-[#30323A]">
                                  {historyItem.date}
                                </div>
                                <div className="border-r border-[#E5E7EB] px-5 py-5 text-center text-[16px] font-semibold text-[#1F2937]">
                                  {historyItem.receivedAmount}
                                </div>
                                <div className="border-r border-[#E5E7EB] px-5 py-5 text-center text-[16px] text-[#30323A]">
                                  {historyItem.selfFinancer}
                                </div>
                                <div className="border-r border-[#E5E7EB] px-5 py-5 text-center text-[16px] text-[#30323A]">
                                  {historyItem.paymentMethod}
                                </div>
                                <div className="border-r border-[#E5E7EB] px-5 py-5 text-center text-[16px] text-[#30323A]">
                                  {historyItem.txnId}
                                </div>
                                <div className="px-5 py-5 text-center text-[16px] text-[#30323A]">
                                  {historyItem.operator}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-5 py-6 text-center text-[15px] font-medium text-[#6B7280]">
                              No payment history found.
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {rows.map((row) => {
          const rowId = String(row.id);
          const isOpen = openId === rowId;
          const isLoading = !!loadingMap[rowId];
          const history = historyMap[rowId] ?? row.history ?? [];
          const error = errorMap[rowId] ?? "";

          return (
            <div
              key={rowId}
              className="rounded-[24px] border border-[#E3E6EB] bg-white p-4 shadow-[0px_3px_12px_rgba(15,23,42,0.03)] sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[17px] font-semibold text-[#111827]">
                    {row.invoiceNumber}
                  </h3>
                  <p className="mt-1 text-[14px] text-[#6B7280]">{row.date}</p>
                </div>

                <button
                  onClick={() => onViewInvoice(row)}
                  className="text-[15px] font-medium text-[#3B82F6] underline underline-offset-4"
                >
                  View
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Info label="Total Amount" value={row.totalAmount} />
                <Info label="Received" value={row.receivedAmount} />
                <Info label="Pending" value={row.pendingAmount} />
                <div className="rounded-[16px] bg-[#F8F9FB] p-3">
                  <p className="text-[12px] text-[#7B8496]">History</p>
                  <button
                    onClick={() => handleToggleHistory(row)}
                    className="mt-1 inline-flex items-center gap-1 text-[14px] font-semibold text-[#111827]"
                  >
                    View
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-4 space-y-3 rounded-[18px] border border-[#E5E7EB] bg-[#F6FAFD] p-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2 rounded-[14px] bg-white p-4 text-[14px] font-medium text-[#4B5563] shadow-[0px_1px_6px_rgba(15,23,42,0.03)]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading history...
                    </div>
                  ) : error ? (
                    <div className="rounded-[14px] bg-white p-4 text-center text-[14px] font-medium text-[#B42318] shadow-[0px_1px_6px_rgba(15,23,42,0.03)]">
                      {error}
                    </div>
                  ) : history.length > 0 ? (
                    history.map((historyItem) => (
                      <div
                        key={historyItem.id}
                        className="rounded-[14px] bg-white p-3 shadow-[0px_1px_6px_rgba(15,23,42,0.03)]"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <Info label="Date" value={historyItem.date} />
                          <Info label="Amount" value={historyItem.receivedAmount} />
                          <Info
                            label="Self/Financer"
                            value={historyItem.selfFinancer}
                          />
                          <Info label="Method" value={historyItem.paymentMethod} />
                          <Info label="TXN ID" value={historyItem.txnId} />
                          <Info label="Operator" value={historyItem.operator} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[14px] bg-white p-4 text-center text-[14px] font-medium text-[#6B7280] shadow-[0px_1px_6px_rgba(15,23,42,0.03)]">
                      No payment history found.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-[#F8F9FB] p-3">
      <p className="text-[12px] text-[#7B8496]">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-[#111827]">{value}</p>
    </div>
  );
}