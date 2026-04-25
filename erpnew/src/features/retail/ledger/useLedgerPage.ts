"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createPayment,
  getLedgerInvoiceList,
  getPaymentTracker,
  getPaymentsByCustomer,
  getPaymentsByInvoice,
} from "./api";
import type {
  CreatePaymentPayload,
  LedgerInvoiceRow,
  LedgerInvoicePaymentDetailResponse,
  LedgerCustomerPaymentsResponse,
  PaymentTrackerResponse,
} from "./types";
import { downloadCsv, formatDate, formatCurrency } from "./utils";

export function useLedgerPage(initialFilters?: {
  search?: string;
  customer_id?: string | number;
  invoice_number?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
}) {
  const [filters, setFilters] = useState({
    search: initialFilters?.search ?? "",
    customer_id: initialFilters?.customer_id ?? "",
    invoice_number: initialFilters?.invoice_number ?? "",
    status: initialFilters?.status ?? "",
    from_date: initialFilters?.from_date ?? "",
    to_date: initialFilters?.to_date ?? "",
  });

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<LedgerInvoiceRow[]>([]);
  const [error, setError] = useState("");

  const [selectedInvoice, setSelectedInvoice] =
    useState<LedgerInvoicePaymentDetailResponse | null>(null);
  const [selectedCustomerPayments, setSelectedCustomerPayments] =
    useState<LedgerCustomerPaymentsResponse | null>(null);
  const [selectedTracker, setSelectedTracker] =
    useState<PaymentTrackerResponse | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getLedgerInvoiceList({
        search: String(filters.search || ""),
        customer_id: filters.customer_id || undefined,
        invoice_number: String(filters.invoice_number || ""),
        status: String(filters.status || ""),
        from_date: String(filters.from_date || ""),
        to_date: String(filters.to_date || ""),
      });
      setRows(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load ledger list");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.total += Number(row.total_amount || 0);
        acc.received += Number(row.received_amount || 0);
        acc.pending += Number(row.pending_amount || 0);
        return acc;
      },
      { total: 0, received: 0, pending: 0 }
    );
  }, [rows]);

  const openInvoicePayments = useCallback(async (invoiceId: string | number) => {
    try {
      setDetailLoading(true);
      const res = await getPaymentsByInvoice(invoiceId);
      setSelectedInvoice(res);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const openCustomerPayments = useCallback(async (customerId: string | number) => {
    try {
      setCustomerLoading(true);
      const res = await getPaymentsByCustomer(customerId);
      setSelectedCustomerPayments(res);
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  const openPaymentTracker = useCallback(async (customerId: string | number) => {
    try {
      setTrackerLoading(true);
      const res = await getPaymentTracker(customerId);
      setSelectedTracker(res);
    } finally {
      setTrackerLoading(false);
    }
  }, []);

  const submitPayment = useCallback(
    async (payload: CreatePaymentPayload) => {
      try {
        setPaymentSubmitting(true);
        await createPayment(payload);
        await loadList();

        if (payload.invoice_id) {
          await openInvoicePayments(payload.invoice_id);
        }
      } finally {
        setPaymentSubmitting(false);
      }
    },
    [loadList, openInvoicePayments]
  );

  const exportCurrentReport = useCallback(() => {
    const csvRows = rows.map((row) => ({
      "Invoice Number": row.invoice_number,
      "Client Name": row.client_name || "—",
      Phone: row.phone || "—",
      "Transaction ID": row.txn_id || "—",
      Date: formatDate(row.date),
      "Total Amount": row.total_amount,
      "Received Amount": row.received_amount,
      "Pending Amount": row.pending_amount,
      Status: row.status,
      "Payment Method": row.payment_method || "—",
      "Store Code": row.store_code || "—",
      Action: row.action,
    }));

    const suffix = new Date().toISOString().slice(0, 10);
    downloadCsv(`ledger-report-${suffix}.csv`, csvRows);
  }, [rows]);

  return {
    filters,
    setFilters,

    loading,
    error,
    rows,
    reload: loadList,

    totals: {
      total: formatCurrency(totals.total),
      received: formatCurrency(totals.received),
      pending: formatCurrency(totals.pending),
      totalRaw: totals.total,
      receivedRaw: totals.received,
      pendingRaw: totals.pending,
    },

    selectedInvoice,
    selectedCustomerPayments,
    selectedTracker,

    detailLoading,
    trackerLoading,
    customerLoading,
    paymentSubmitting,

    openInvoicePayments,
    openCustomerPayments,
    openPaymentTracker,
    submitPayment,
    exportCurrentReport,

    setSelectedInvoice,
    setSelectedCustomerPayments,
    setSelectedTracker,
  };
}