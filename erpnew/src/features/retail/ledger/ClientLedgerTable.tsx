"use client";

import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  getPaymentsByInvoice,
  viewInvoicePdf,
} from "./api";
import type { ClientInvoiceHistoryRow, ClientInvoiceRow } from "./types";
import { mapInvoiceHistoryToUi } from "./utils";

type Props = {
  rows: ClientInvoiceRow[];
  onViewInvoice?: (invoice: ClientInvoiceRow) => void;
};

function isValidValue(value: unknown) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== "undefined" &&
    value !== "null"
  );
}

function getDisplayValue(...values: unknown[]) {
  const found = values.find((value) => isValidValue(value));
  return found ? String(found) : "—";
}

function getIdFromPathname(pathname: string | null) {
  if (!pathname) return null;

  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];

  return isValidValue(last) ? String(last) : null;
}

function getInvoiceIdFromRow(row: ClientInvoiceRow & any) {
  const value =
    row?.invoiceId ??
    row?.invoice_id ??
    row?.reference_id ??
    row?.referenceId ??
    row?.raw?.invoice_id ??
    row?.raw?.invoiceId ??
    row?.raw?.reference_id ??
    row?.raw?.referenceId ??
    null;

  return isValidValue(value) ? String(value) : null;
}

function getRowKey(row: ClientInvoiceRow & any, index: number) {
  return String(
    getInvoiceIdFromRow(row) ??
      row?.invoiceNumber ??
      row?.invoice_number ??
      row?.raw?.invoice_number ??
      `ledger-row-${index}`
  );
}

export default function ClientLedgerTable({ rows, onViewInvoice }: Props) {
  const pathname = usePathname();

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [historyMap, setHistoryMap] = useState<
    Record<string, ClientInvoiceHistoryRow[]>
  >({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});
  const [viewingMap, setViewingMap] = useState<Record<string, boolean>>({});

  const safeRows = useMemo(() => rows ?? [], [rows]);

  const getSafeInvoiceId = (row: ClientInvoiceRow & any) => {
    return getInvoiceIdFromRow(row) || getIdFromPathname(pathname);
  };

  const handleToggleHistory = async (
    row: ClientInvoiceRow & any,
    index: number
  ) => {
    const rowKey = getRowKey(row, index);
    const invoiceId = getSafeInvoiceId(row);

    if (!isValidValue(invoiceId)) {
      setOpenKey(rowKey);
      setHistoryMap((prev) => ({ ...prev, [rowKey]: [] }));
      setLoadedMap((prev) => ({ ...prev, [rowKey]: true }));
      setErrorMap((prev) => ({
        ...prev,
        [rowKey]:
          "Invoice ID missing. Payment history needs real invoice_id/reference_id.",
      }));
      return;
    }

    if (openKey === rowKey) {
      setOpenKey(null);
      return;
    }

    setOpenKey(rowKey);

    if (loadedMap[rowKey]) return;

    try {
      setLoadingMap((prev) => ({ ...prev, [rowKey]: true }));
      setErrorMap((prev) => ({ ...prev, [rowKey]: "" }));

      const res = await getPaymentsByInvoice(invoiceId);

      if (!res?.success) {
        throw new Error(res?.message || "Failed to load payment history.");
      }

      setHistoryMap((prev) => ({
        ...prev,
        [rowKey]: mapInvoiceHistoryToUi(res),
      }));

      setLoadedMap((prev) => ({ ...prev, [rowKey]: true }));
    } catch (error) {
      console.error("Failed to load invoice history:", error);

      setHistoryMap((prev) => ({ ...prev, [rowKey]: [] }));
      setLoadedMap((prev) => ({ ...prev, [rowKey]: true }));
      setErrorMap((prev) => ({
        ...prev,
        [rowKey]:
          error instanceof Error
            ? error.message
            : "Failed to load payment history.",
      }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [rowKey]: false }));
    }
  };

  const handleViewInvoice = async (
    row: ClientInvoiceRow & any,
    index: number
  ) => {
    const rowKey = getRowKey(row, index);
    const invoiceId = getSafeInvoiceId(row);

    if (!isValidValue(invoiceId)) {
      console.error("Invoice ID missing for view invoice:", row);
      alert("Invoice ID missing. Cannot open invoice.");
      return;
    }

    try {
      setViewingMap((prev) => ({ ...prev, [rowKey]: true }));
      await viewInvoicePdf(invoiceId);
    } catch (error) {
      console.error("Failed to view invoice:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to view invoice PDF."
      );
    } finally {
      setViewingMap((prev) => ({ ...prev, [rowKey]: false }));
    }
  };

  return (
    <>
      <div className="hidden w-full overflow-hidden rounded-[34px] border border-[#E5E7EB] bg-white shadow-[1px_1px_4px_0px_rgba(0,0,0,0.10)] lg:block">
        <div className="overflow-x-auto dashboard-hidden-scroll">
          <table className="w-full min-w-[1180px] table-fixed border-separate border-spacing-0 font-erp">
            <colgroup>
              <col className="w-[16.2%]" />
              <col className="w-[14.5%]" />
              <col className="w-[13.1%]" />
              <col className="w-[15.9%]" />
              <col className="w-[15.8%]" />
              <col className="w-[14.2%]" />
              <col className="w-[10.3%]" />
            </colgroup>

            <thead>
              <tr className="h-[64px] bg-black text-white">
                {[
                  "Invoice Number",
                  "Date",
                  "Total Amount",
                  "Received Amount",
                  "Pending Amount",
                  "Payment Tracking",
                  "Action",
                ].map((header, index) => (
                  <th
                    key={header}
                    className={[
                      "border-b border-black px-4 text-center align-middle text-[16px] font-semibold leading-[20px] tracking-[-0.03em]",
                      index === 0 ? "rounded-tl-[34px]" : "",
                      index === 6 ? "rounded-tr-[34px]" : "",
                    ].join(" ")}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {safeRows.length > 0 ? (
                safeRows.map((row: ClientInvoiceRow & any, index) => {
                  const rowKey = getRowKey(row, index);
                  const isOpen = openKey === rowKey;
                  const isLoading = !!loadingMap[rowKey];
                  const isViewing = !!viewingMap[rowKey];
                  const history = historyMap[rowKey] ?? row.history ?? [];
                  const error = errorMap[rowKey] ?? "";

                  return (
                    <Fragment key={rowKey}>
                      <tr className="h-[58px] bg-white">
                        <DataCell>
                          {getDisplayValue(
                            row.invoiceNumber,
                            row.invoice_number,
                            row.raw?.invoice_number
                          )}
                        </DataCell>

                        <DataCell>
                          {getDisplayValue(row.date, row.raw?.date)}
                        </DataCell>

                        <AmountCell>
                          {getDisplayValue(
                            row.totalAmount,
                            row.total_amount,
                            row.raw?.total_amount,
                            "₹0"
                          )}
                        </AmountCell>

                        <AmountCell>
                          {getDisplayValue(
                            row.receivedAmount,
                            row.received_amount,
                            row.raw?.received_amount,
                            "₹0"
                          )}
                        </AmountCell>

                        <AmountCell>
                          {getDisplayValue(
                            row.pendingAmount,
                            row.pending_amount,
                            row.raw?.pending_amount,
                            "₹0"
                          )}
                        </AmountCell>

                        <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle">
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleToggleHistory(row, index)}
                            className="inline-flex h-[34px] items-center justify-center gap-[8px] text-[16px] font-medium leading-[20px] tracking-[-0.03em] text-[#101828] transition hover:text-[#2563EB] disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <span>View History</span>
                            {isLoading ? (
                              <Loader2 className="h-[16px] w-[16px] animate-spin" />
                            ) : isOpen ? (
                              <ChevronUp className="h-[16px] w-[16px] stroke-[2.4]" />
                            ) : (
                              <ChevronDown className="h-[16px] w-[16px] stroke-[2.4]" />
                            )}
                          </button>
                        </td>

                        <td className="border-b border-[#E5E7EB] px-4 text-center align-middle">
                          <button
                            type="button"
                            disabled={isViewing}
                            onClick={() => handleViewInvoice(row, index)}
                            className="text-[16px] font-medium leading-[20px] tracking-[-0.03em] text-[#2563EB] underline underline-offset-[3px] transition hover:text-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isViewing ? "Opening..." : "View"}
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td
                            colSpan={7}
                            className="border-b border-[#E5E7EB] bg-[#EEF7FC] p-0"
                          >
                            <div className="grid h-[58px] grid-cols-6 border-b border-[#E5E7EB] bg-[#EEF7FC]">
                              {[
                                "Date",
                                "Received Amount",
                                "Self/Financer",
                                "Payment Method",
                                "TXN ID",
                                "Operator",
                              ].map((item, idx) => (
                                <div
                                  key={item}
                                  className={[
                                    "flex items-center justify-center px-4 text-center text-[16px] font-semibold leading-[20px] tracking-[-0.03em] text-[#111827]",
                                    idx !== 5
                                      ? "border-r border-[#E5E7EB]"
                                      : "",
                                  ].join(" ")}
                                >
                                  {item}
                                </div>
                              ))}
                            </div>

                            {isLoading ? (
                              <div className="flex h-[62px] items-center justify-center gap-2 bg-[#EEF7FC] text-[15px] font-medium text-[#475467]">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading history...
                              </div>
                            ) : error ? (
                              <div className="flex h-[62px] items-center justify-center bg-[#EEF7FC] px-5 text-center text-[15px] font-medium text-[#B42318]">
                                {error}
                              </div>
                            ) : history.length > 0 ? (
                              history.map((historyItem, historyIndex) => (
                                <div
                                  key={
                                    historyItem.id ?? `history-${historyIndex}`
                                  }
                                  className="grid h-[62px] grid-cols-6 border-b border-[#E5E7EB] bg-[#EEF7FC] last:border-b-0"
                                >
                                  <HistoryCell value={historyItem.date} />
                                  <HistoryCell
                                    value={historyItem.receivedAmount}
                                    strong
                                  />
                                  <HistoryCell
                                    value={historyItem.selfFinancer}
                                  />
                                  <HistoryCell
                                    value={historyItem.paymentMethod}
                                  />
                                  <HistoryCell value={historyItem.txnId} />
                                  <div className="flex items-center justify-center px-4 text-center text-[16px] font-normal leading-[20px] tracking-[-0.03em] text-[#30323A]">
                                    {historyItem.operator || "—"}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex h-[62px] items-center justify-center bg-[#EEF7FC] text-center text-[15px] font-medium text-[#64748B]">
                                No payment history found.
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="h-[180px] px-5 text-center align-middle text-[15px] font-medium text-[#64748B]"
                  >
                    No ledger invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {safeRows.length > 0 ? (
          safeRows.map((row: ClientInvoiceRow & any, index) => {
            const rowKey = getRowKey(row, index);
            const isOpen = openKey === rowKey;
            const isLoading = !!loadingMap[rowKey];
            const isViewing = !!viewingMap[rowKey];
            const history = historyMap[rowKey] ?? row.history ?? [];
            const error = errorMap[rowKey] ?? "";

            return (
              <div
                key={rowKey}
                className="rounded-[26px] border border-[#E5E7EB] bg-white p-4 shadow-[1px_1px_4px_0px_rgba(0,0,0,0.10)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-[-0.03em] text-[#101828]">
                      {getDisplayValue(
                        row.invoiceNumber,
                        row.invoice_number,
                        row.raw?.invoice_number
                      )}
                    </h3>
                    <p className="mt-1 text-[14px] font-medium text-[#667085]">
                      {getDisplayValue(row.date, row.raw?.date)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isViewing}
                    onClick={() => handleViewInvoice(row, index)}
                    className="text-[15px] font-medium text-[#2563EB] underline underline-offset-[3px] disabled:opacity-60"
                  >
                    {isViewing ? "Opening..." : "View"}
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Info
                    label="Total Amount"
                    value={getDisplayValue(
                      row.totalAmount,
                      row.total_amount,
                      row.raw?.total_amount,
                      "₹0"
                    )}
                  />
                  <Info
                    label="Received"
                    value={getDisplayValue(
                      row.receivedAmount,
                      row.received_amount,
                      row.raw?.received_amount,
                      "₹0"
                    )}
                  />
                  <Info
                    label="Pending"
                    value={getDisplayValue(
                      row.pendingAmount,
                      row.pending_amount,
                      row.raw?.pending_amount,
                      "₹0"
                    )}
                  />

                  <div className="rounded-[18px] bg-[#F8FAFC] p-3">
                    <p className="text-[12px] font-medium text-[#667085]">
                      History
                    </p>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggleHistory(row, index)}
                      className="mt-1 inline-flex items-center gap-1 text-[14px] font-semibold text-[#101828] disabled:opacity-70"
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
                  <div className="mt-4 space-y-3 rounded-[20px] border border-[#E5E7EB] bg-[#EEF7FC] p-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2 rounded-[16px] bg-white p-4 text-[14px] font-medium text-[#475467]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading history...
                      </div>
                    ) : error ? (
                      <div className="rounded-[16px] bg-white p-4 text-center text-[14px] font-medium text-[#B42318]">
                        {error}
                      </div>
                    ) : history.length > 0 ? (
                      history.map((historyItem, historyIndex) => (
                        <div
                          key={
                            historyItem.id ?? `history-mobile-${historyIndex}`
                          }
                          className="rounded-[16px] bg-white p-3"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <Info label="Date" value={historyItem.date} />
                            <Info
                              label="Amount"
                              value={historyItem.receivedAmount}
                            />
                            <Info
                              label="Self/Financer"
                              value={historyItem.selfFinancer}
                            />
                            <Info
                              label="Method"
                              value={historyItem.paymentMethod}
                            />
                            <Info label="TXN ID" value={historyItem.txnId} />
                            <Info
                              label="Operator"
                              value={historyItem.operator}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[16px] bg-white p-4 text-center text-[14px] font-medium text-[#64748B]">
                        No payment history found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-[26px] border border-[#E5E7EB] bg-white p-6 text-center text-[14px] font-medium text-[#64748B] shadow-[1px_1px_4px_0px_rgba(0,0,0,0.10)]">
            No ledger invoices found.
          </div>
        )}
      </div>
    </>
  );
}

function DataCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[16px] font-normal leading-[20px] tracking-[-0.03em] text-[#30323A]">
      {children}
    </td>
  );
}

function AmountCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="border-b border-r border-[#E5E7EB] px-4 text-center align-middle text-[16px] font-semibold leading-[20px] tracking-[-0.03em] text-[#101828]">
      {children}
    </td>
  );
}

function HistoryCell({
  value,
  strong = false,
}: {
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center border-r border-[#E5E7EB] px-4 text-center text-[16px] leading-[20px] tracking-[-0.03em] text-[#30323A]",
        strong ? "font-semibold text-[#101828]" : "font-normal",
      ].join(" ")}
    >
      {value || "—"}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-[#F8FAFC] p-3">
      <p className="text-[12px] font-medium text-[#667085]">{label}</p>
      <p className="mt-1 text-[14px] font-semibold text-[#101828]">
        {value || "—"}
      </p>
    </div>
  );
}