"use client";

import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { getPaymentsByInvoice, viewInvoicePdf } from "./api";
import type { ClientInvoiceHistoryRow, ClientInvoiceRow } from "./types";
import { mapInvoiceHistoryToUi } from "./utils";

type Props = {
  rows: ClientInvoiceRow[];
  onViewInvoice?: (invoice: ClientInvoiceRow) => void | Promise<void>;
  onFetchPayments?: (
    invoiceId: string | number,
    invoice?: ClientInvoiceRow
  ) => Promise<any>;
  onDownloadInvoice?: (invoice: ClientInvoiceRow) => void | Promise<void>;
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
    row?.id ??
    row?.reference_id ??
    row?.referenceId ??
    row?.invoice?.id ??
    row?.raw?.invoice_id ??
    row?.raw?.invoiceId ??
    row?.raw?.id ??
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

export default function ClientLedgerTable({
  rows,
  onViewInvoice,
  onFetchPayments,
  onDownloadInvoice,
}: Props) {
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

      const res = onFetchPayments
        ? await onFetchPayments(invoiceId as string | number, row)
        : await getPaymentsByInvoice(invoiceId);

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
      console.error("Invoice ID missing for invoice action:", row);
      alert("Invoice ID missing. Cannot open/download invoice.");
      return;
    }

    try {
      setViewingMap((prev) => ({ ...prev, [rowKey]: true }));

      if (onDownloadInvoice) {
        await onDownloadInvoice(row);
        return;
      }

      if (onViewInvoice) {
        await onViewInvoice(row);
        return;
      }

      await viewInvoicePdf(invoiceId);
    } catch (error) {
      console.error("Failed to process invoice action:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to process invoice PDF."
      );
    } finally {
      setViewingMap((prev) => ({ ...prev, [rowKey]: false }));
    }
  };

  return (
    <>
      <div className="hidden w-full rounded-erp-2xl border border-erp-border bg-erp-card shadow-erp-card lg:block">
        <div className="w-full overflow-x-auto overflow-y-visible rounded-erp-2xl table-drag-scroll">
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

            <thead className="sticky top-0 z-10">
              <tr className="h-[64px] bg-erp-dark text-white">
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
                      "whitespace-nowrap border-b border-erp-dark px-4 text-center align-middle text-[16px] font-semibold leading-5 tracking-[-0.03em]",
                      index === 0 ? "rounded-tl-erp-2xl" : "",
                      index === 6 ? "rounded-tr-erp-2xl" : "",
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
                      <tr className="h-[60px] bg-erp-card transition hover:bg-erp-card-soft">
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

                        <td className="border-b border-r border-erp-border px-4 text-center align-middle">
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleToggleHistory(row, index)}
                            className="inline-flex h-[34px] items-center justify-center gap-2 whitespace-nowrap text-[16px] font-medium leading-5 tracking-[-0.03em] text-erp-heading transition hover:text-erp-primary disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            <span>View History</span>
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isOpen ? (
                              <ChevronUp className="h-4 w-4 stroke-[2.4]" />
                            ) : (
                              <ChevronDown className="h-4 w-4 stroke-[2.4]" />
                            )}
                          </button>
                        </td>

                        <td className="border-b border-erp-border px-4 text-center align-middle">
                          <button
                            type="button"
                            disabled={isViewing}
                            onClick={() => handleViewInvoice(row, index)}
                            className="whitespace-nowrap text-[16px] font-medium leading-5 tracking-[-0.03em] text-erp-primary underline underline-offset-[3px] transition hover:text-erp-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isViewing ? "Opening..." : "View"}
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td
                            colSpan={7}
                            className="border-b border-erp-border bg-erp-primary-soft p-0"
                          >
                            <div className="min-w-[1180px]">
                              <div className="grid h-[58px] grid-cols-6 border-b border-erp-border bg-erp-primary-soft">
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
                                      "flex items-center justify-center px-4 text-center text-[16px] font-semibold leading-5 tracking-[-0.03em] text-erp-heading",
                                      idx !== 5
                                        ? "border-r border-erp-border"
                                        : "",
                                    ].join(" ")}
                                  >
                                    {item}
                                  </div>
                                ))}
                              </div>

                              {isLoading ? (
                                <div className="flex h-[62px] items-center justify-center gap-2 bg-erp-primary-soft text-[15px] font-medium text-erp-muted">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Loading history...
                                </div>
                              ) : error ? (
                                <div className="flex h-[62px] items-center justify-center bg-erp-primary-soft px-5 text-center text-[15px] font-medium text-erp-danger">
                                  {error}
                                </div>
                              ) : history.length > 0 ? (
                                history.map((historyItem, historyIndex) => (
                                  <div
                                    key={
                                      historyItem.id ??
                                      `history-${historyIndex}`
                                    }
                                    className="grid h-[62px] grid-cols-6 border-b border-erp-border bg-erp-primary-soft last:border-b-0"
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
                                    <div className="flex min-w-0 items-center justify-center px-4 text-center text-[16px] font-normal leading-5 tracking-[-0.03em] text-erp-text-soft">
                                      <span className="truncate">
                                        {historyItem.operator || "—"}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="flex h-[62px] items-center justify-center bg-erp-primary-soft text-center text-[15px] font-medium text-erp-muted">
                                  No payment history found.
                                </div>
                              )}
                            </div>
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
                    className="h-[180px] px-5 text-center align-middle text-[15px] font-medium text-erp-muted"
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
                className="rounded-erp-xl border border-erp-border bg-erp-card p-4 shadow-erp-card"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[17px] font-semibold leading-[22px] tracking-[-0.03em] text-erp-heading">
                      {getDisplayValue(
                        row.invoiceNumber,
                        row.invoice_number,
                        row.raw?.invoice_number
                      )}
                    </h3>
                    <p className="mt-1 text-[14px] font-medium leading-[18px] text-erp-muted">
                      {getDisplayValue(row.date, row.raw?.date)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isViewing}
                    onClick={() => handleViewInvoice(row, index)}
                    className="shrink-0 text-[15px] font-medium text-erp-primary underline underline-offset-[3px] transition hover:text-erp-primary-hover disabled:opacity-60"
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

                  <div className="rounded-erp-sm bg-erp-card-soft p-3">
                    <p className="text-[12px] font-medium leading-4 text-erp-muted">
                      History
                    </p>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleToggleHistory(row, index)}
                      className="mt-1 inline-flex items-center gap-1 text-[14px] font-semibold leading-[18px] text-erp-heading transition hover:text-erp-primary disabled:opacity-70"
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
                  <div className="mt-4 space-y-3 rounded-erp-md border border-erp-border bg-erp-primary-soft p-3">
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2 rounded-erp-sm bg-erp-card p-4 text-[14px] font-medium text-erp-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading history...
                      </div>
                    ) : error ? (
                      <div className="rounded-erp-sm bg-erp-card p-4 text-center text-[14px] font-medium text-erp-danger">
                        {error}
                      </div>
                    ) : history.length > 0 ? (
                      history.map((historyItem, historyIndex) => (
                        <div
                          key={
                            historyItem.id ?? `history-mobile-${historyIndex}`
                          }
                          className="rounded-erp-sm bg-erp-card p-3"
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
                      <div className="rounded-erp-sm bg-erp-card p-4 text-center text-[14px] font-medium text-erp-muted">
                        No payment history found.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-erp-xl border border-erp-border bg-erp-card p-6 text-center text-[14px] font-medium text-erp-muted shadow-erp-card">
            No ledger invoices found.
          </div>
        )}
      </div>
    </>
  );
}

function DataCell({ children }: { children: ReactNode }) {
  return (
    <td className="min-w-0 border-b border-r border-erp-border px-4 text-center align-middle text-[16px] font-normal leading-5 tracking-[-0.03em] text-erp-text-soft">
      <div className="mx-auto max-w-full truncate">{children}</div>
    </td>
  );
}

function AmountCell({ children }: { children: ReactNode }) {
  return (
    <td className="min-w-0 border-b border-r border-erp-border px-4 text-center align-middle text-[16px] font-semibold leading-5 tracking-[-0.03em] text-erp-heading">
      <div className="mx-auto max-w-full truncate">{children}</div>
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
        "flex min-w-0 items-center justify-center border-r border-erp-border px-4 text-center text-[16px] leading-5 tracking-[-0.03em] text-erp-text-soft",
        strong ? "font-semibold text-erp-heading" : "font-normal",
      ].join(" ")}
    >
      <span className="truncate">{value || "—"}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-erp-sm bg-erp-card-soft p-3">
      <p className="text-[12px] font-medium leading-4 text-erp-muted">
        {label}
      </p>
      <p className="mt-1 break-words text-[14px] font-semibold leading-[18px] text-erp-heading">
        {value || "—"}
      </p>
    </div>
  );
}