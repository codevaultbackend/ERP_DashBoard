"use client";

import {
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

import {
  Fragment,
  useMemo,
  useState,
} from "react";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

import {
  getPaymentsByInvoice,
  viewInvoicePdf,
} from "./api";

import type {
  ClientInvoiceHistoryRow,
  ClientInvoiceRow,
} from "./types";

import {
  mapInvoiceHistoryToUi,
} from "./utils";

import PendingAmountModal from "../../../features/retail/billing/components/PendingAmountModal";

type Props = {
  rows: ClientInvoiceRow[];

  onViewInvoice?: (
    invoice: ClientInvoiceRow
  ) => void | Promise<void>;

  onFetchPayments?: (
    invoiceId: string | number,
    invoice?: ClientInvoiceRow
  ) => Promise<any>;

  onDownloadInvoice?: (
    invoice: ClientInvoiceRow
  ) => void | Promise<void>;
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

function getDisplayValue(
  ...values: unknown[]
) {
  const found = values.find((value) =>
    isValidValue(value)
  );

  return found ? String(found) : "—";
}

function getIdFromPathname(
  pathname: string | null
) {
  if (!pathname) return null;

  const segments = pathname
    .split("/")
    .filter(Boolean);

  const last =
    segments[segments.length - 1];

  return isValidValue(last)
    ? String(last)
    : null;
}

function getInvoiceIdFromRow(
  row: ClientInvoiceRow & any
) {
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

  return isValidValue(value)
    ? String(value)
    : null;
}

function getRowKey(
  row: ClientInvoiceRow & any,
  index: number
) {
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

  const [openKey, setOpenKey] =
    useState<string | null>(null);

  const [historyMap, setHistoryMap] =
    useState<
      Record<
        string,
        ClientInvoiceHistoryRow[]
      >
    >({});

  const [loadingMap, setLoadingMap] =
    useState<
      Record<string, boolean>
    >({});

  const [loadedMap, setLoadedMap] =
    useState<
      Record<string, boolean>
    >({});

  const [errorMap, setErrorMap] =
    useState<Record<string, string>>(
      {}
    );

  const [viewingMap, setViewingMap] =
    useState<
      Record<string, boolean>
    >({});

  // =========================================
  // PENDING MODAL STATES
  // =========================================
  const [
    pendingModalOpen,
    setPendingModalOpen,
  ] = useState(false);

  const [
    selectedInvoice,
    setSelectedInvoice,
  ] = useState<any>(null);

  // =========================================
  // CHECK ROUTE
  // =========================================
  const isPendingAmountPage =
    pathname?.includes(
      "/billing/pending-amount/"
    );

  const safeRows = useMemo(
    () => rows ?? [],
    [rows]
  );

  const getSafeInvoiceId = (
    row: ClientInvoiceRow & any
  ) => {
    return (
      getInvoiceIdFromRow(row) ||
      getIdFromPathname(pathname)
    );
  };

  // =========================================
  // TOGGLE HISTORY
  // =========================================
  const handleToggleHistory =
    async (
      row: ClientInvoiceRow & any,
      index: number
    ) => {
      const rowKey = getRowKey(
        row,
        index
      );

      const invoiceId =
        getSafeInvoiceId(row);

      if (!isValidValue(invoiceId)) {
        setOpenKey(rowKey);

        setHistoryMap((prev) => ({
          ...prev,
          [rowKey]: [],
        }));

        setLoadedMap((prev) => ({
          ...prev,
          [rowKey]: true,
        }));

        setErrorMap((prev) => ({
          ...prev,
          [rowKey]:
            "Invoice ID missing.",
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
        setLoadingMap((prev) => ({
          ...prev,
          [rowKey]: true,
        }));

        setErrorMap((prev) => ({
          ...prev,
          [rowKey]: "",
        }));

        const res =
          onFetchPayments
            ? await onFetchPayments(
                invoiceId,
                row
              )
            : await getPaymentsByInvoice(
                invoiceId
              );

        if (!res?.success) {
          throw new Error(
            res?.message ||
              "Failed to load payment history."
          );
        }

        setHistoryMap((prev) => ({
          ...prev,
          [rowKey]:
            mapInvoiceHistoryToUi(
              res
            ),
        }));

        setLoadedMap((prev) => ({
          ...prev,
          [rowKey]: true,
        }));
      } catch (error) {
        console.error(error);

        setErrorMap((prev) => ({
          ...prev,
          [rowKey]:
            error instanceof Error
              ? error.message
              : "Failed to load history.",
        }));
      } finally {
        setLoadingMap((prev) => ({
          ...prev,
          [rowKey]: false,
        }));
      }
    };

  // =========================================
  // VIEW INVOICE
  // =========================================
  const handleViewInvoice =
    async (
      row: ClientInvoiceRow & any,
      index: number
    ) => {
      const rowKey = getRowKey(
        row,
        index
      );

      const invoiceId =
        getSafeInvoiceId(row);

      if (!invoiceId) return;

      try {
        setViewingMap((prev) => ({
          ...prev,
          [rowKey]: true,
        }));

        if (onDownloadInvoice) {
          await onDownloadInvoice(
            row
          );

          return;
        }

        if (onViewInvoice) {
          await onViewInvoice(row);

          return;
        }

        await viewInvoicePdf(
          invoiceId
        );
      } catch (error) {
        console.error(error);
      } finally {
        setViewingMap((prev) => ({
          ...prev,
          [rowKey]: false,
        }));
      }
    };

  return (
    <>
      <div className="hidden w-full rounded-erp-2xl border border-erp-border bg-erp-card shadow-erp-card lg:block">
        <div className="w-full overflow-x-auto overflow-y-visible rounded-erp-2xl table-drag-scroll">

          <table className="w-full min-w-[1180px] table-fixed border-separate border-spacing-0 font-erp">

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
                ].map((header) => (
                  <th
                    key={header}
                    className="border-b border-erp-dark px-4 text-center align-middle text-[16px] font-semibold"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {safeRows.length > 0 ? (
                safeRows.map(
                  (
                    row:
                      | ClientInvoiceRow
                      | any,
                    index
                  ) => {

                    const rowKey =
                      getRowKey(
                        row,
                        index
                      );

                    const isOpen =
                      openKey === rowKey;

                    const isLoading =
                      !!loadingMap[
                        rowKey
                      ];

                    const isViewing =
                      !!viewingMap[
                        rowKey
                      ];

                    return (
                      <Fragment
                        key={rowKey}
                      >
                        <tr className="h-[60px] bg-white">

                          <DataCell>
                            {getDisplayValue(
                              row.invoiceNumber
                            )}
                          </DataCell>

                          <DataCell>
                            {getDisplayValue(
                              row.date
                            )}
                          </DataCell>

                          <AmountCell>
                            {getDisplayValue(
                              row.totalAmount
                            )}
                          </AmountCell>

                          <AmountCell>
                            {getDisplayValue(
                              row.receivedAmount
                            )}
                          </AmountCell>

                          <AmountCell>
                            {getDisplayValue(
                              row.pendingAmount
                            )}
                          </AmountCell>

                          {/* HISTORY BUTTON */}
                          <td className="border-b border-r border-erp-border px-4 text-center align-middle">

                            <button
                              type="button"
                              disabled={
                                isLoading
                              }
                              onClick={() =>
                                handleToggleHistory(
                                  row,
                                  index
                                )
                              }
                              className="inline-flex items-center gap-2 text-[15px] font-medium"
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

                          {/* ACTION BUTTON */}
                          <td className="border-b border-erp-border px-4 text-center align-middle">

                            {isPendingAmountPage ? (

                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedInvoice(
                                    row
                                  );

                                  setPendingModalOpen(
                                    true
                                  );
                                }}
                                className="text-[16px] font-medium text-[#2563EB] underline underline-offset-[3px]"
                              >
                                Edit
                              </button>

                            ) : (

                              <button
                                type="button"
                                disabled={
                                  isViewing
                                }
                                onClick={() =>
                                  handleViewInvoice(
                                    row,
                                    index
                                  )
                                }
                                className="text-[16px] font-medium text-[#2563EB] underline underline-offset-[3px]"
                              >
                                {isViewing
                                  ? "Opening..."
                                  : "View"}
                              </button>

                            )}
                          </td>
                        </tr>

                        {/* =========================================
                            HISTORY EXPANSION
                        ========================================= */}
                        {isOpen && (
                          <tr>
                            <td
                              colSpan={7}
                              className="border-b border-erp-border bg-[#F8FAFC] p-0"
                            >
                              <div className="min-w-[1180px]">

                                {/* HEADER */}
                                <div className="grid h-[58px] grid-cols-6 border-b border-erp-border bg-[#F1F5F9]">

                                  {[
                                    "Date",
                                    "Received Amount",
                                    "Self/Financer",
                                    "Payment Method",
                                    "TXN ID",
                                    "Operator",
                                  ].map(
                                    (
                                      item,
                                      idx
                                    ) => (
                                      <div
                                        key={
                                          item
                                        }
                                        className={[
                                          "flex items-center justify-center px-4 text-center text-[15px] font-semibold text-[#111827]",
                                          idx !==
                                          5
                                            ? "border-r border-erp-border"
                                            : "",
                                        ].join(
                                          " "
                                        )}
                                      >
                                        {
                                          item
                                        }
                                      </div>
                                    )
                                  )}
                                </div>

                                {/* LOADING */}
                                {isLoading ? (

                                  <div className="flex h-[62px] items-center justify-center gap-2 bg-[#F8FAFC] text-[15px] font-medium text-[#64748B]">

                                    <Loader2 className="h-4 w-4 animate-spin" />

                                    Loading history...

                                  </div>

                                ) : errorMap[
                                    rowKey
                                  ] ? (

                                  <div className="flex h-[62px] items-center justify-center bg-[#F8FAFC] px-5 text-center text-[15px] font-medium text-red-500">

                                    {
                                      errorMap[
                                        rowKey
                                      ]
                                    }

                                  </div>

                                ) : (
                                  historyMap[
                                    rowKey
                                  ] ??
                                  []
                                ).length > 0 ? (

                                  (
                                    historyMap[
                                      rowKey
                                    ] ?? []
                                  ).map(
                                    (
                                      historyItem,
                                      historyIndex
                                    ) => (
                                      <div
                                        key={
                                          historyItem.id ??
                                          `history-${historyIndex}`
                                        }
                                        className="grid h-[62px] grid-cols-6 border-b border-erp-border bg-[#F8FAFC] last:border-b-0"
                                      >

                                        <HistoryCell
                                          value={
                                            historyItem.date
                                          }
                                        />

                                        <HistoryCell
                                          value={
                                            historyItem.receivedAmount
                                          }
                                          strong
                                        />

                                        <HistoryCell
                                          value={
                                            historyItem.selfFinancer
                                          }
                                        />

                                        <HistoryCell
                                          value={
                                            historyItem.paymentMethod
                                          }
                                        />

                                        <HistoryCell
                                          value={
                                            historyItem.txnId
                                          }
                                        />

                                        <div className="flex min-w-0 items-center justify-center px-4 text-center text-[15px] text-[#475467]">

                                          <span className="truncate">
                                            {historyItem.operator ||
                                              "—"}
                                          </span>

                                        </div>
                                      </div>
                                    )
                                  )

                                ) : (

                                  <div className="flex h-[62px] items-center justify-center bg-[#F8FAFC] text-center text-[15px] font-medium text-[#64748B]">

                                    No payment history found.

                                  </div>

                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  }
                )
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="h-[180px] text-center"
                  >
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================
          PENDING MODAL
      ========================================= */}
      <PendingAmountModal
        open={pendingModalOpen}
        onClose={() => {
          setPendingModalOpen(false);

          setSelectedInvoice(
            null
          );
        }}
        invoiceId={Number(
          getInvoiceIdFromRow(
            selectedInvoice
          )
        )}
        pendingAmount={Number(
          selectedInvoice?.pendingAmount ||
            selectedInvoice?.pending_amount ||
            0
        )}
        client={selectedInvoice}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </>
  );
}

function DataCell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <td className="border-b border-r border-erp-border px-4 text-center text-[16px]">
      {children}
    </td>
  );
}

function AmountCell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <td className="border-b border-r border-erp-border px-4 text-center text-[16px] font-semibold">
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
        "flex min-w-0 items-center justify-center border-r border-erp-border px-4 text-center text-[15px]",
        strong
          ? "font-semibold text-[#111827]"
          : "font-normal text-[#475467]",
      ].join(" ")}
    >
      <span className="truncate">
        {value || "—"}
      </span>
    </div>
  );
}