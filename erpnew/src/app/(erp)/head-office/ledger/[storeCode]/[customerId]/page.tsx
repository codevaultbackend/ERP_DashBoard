"use client";

import { ArrowLeft, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ClientLedgerTable from "../../../../../../features/retail/ledger/ClientLedgerTable";
import InvoicePreviewModal from "../../../../../../features/retail/ledger/InvoicePreviewModal";
import {
  downloadHeadOfficeInvoicePdf,
  fetchHeadCustomerInvoices,
  fetchHeadInvoicePayments,
} from "../../../../../../features/retail/ledger/head-ledger-api";
import type { ClientInvoiceRow } from "../../../../../../features/retail/ledger/types";
import {
  mapHeadCustomerInvoicesToUi,
  mapHeadInvoicePaymentsToHistory,
} from "../../../../../../features/retail/ledger/head-ledger-utils";

function getInvoiceId(invoice: ClientInvoiceRow & any) {
  return (
    invoice?.invoiceId ??
    invoice?.invoice_id ??
    invoice?.id ??
    invoice?.reference_id ??
    invoice?.referenceId ??
    invoice?.raw?.invoice_id ??
    invoice?.raw?.invoiceId ??
    invoice?.raw?.id ??
    invoice?.raw?.reference_id ??
    invoice?.raw?.referenceId ??
    ""
  );
}

export default function HeadOfficeCustomerLedgerPage() {
  const params = useParams();

  const storeCode = decodeURIComponent(String(params?.storeCode || ""));
  const customerId = String(params?.customerId || "");

  const [rows, setRows] = useState<ClientInvoiceRow[]>([]);
  const [selectedInvoice, setSelectedInvoice] =
    useState<ClientInvoiceRow | null>(null);

  const [customerName, setCustomerName] = useState("Customer Ledger");
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCustomerInvoices() {
      try {
        setLoading(true);
        setError("");

        const response = await fetchHeadCustomerInvoices(customerId);
        const mapped = mapHeadCustomerInvoicesToUi(response);

        if (!active) return;

        setRows(mapped.data);
        setCustomerName(
          mapped.customer?.name ||
            mapped.customer?.client_name ||
            mapped.customer?.customer_name ||
            "Customer Ledger"
        );
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch customer invoices"
        );
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (customerId) loadCustomerInvoices();

    return () => {
      active = false;
    };
  }, [customerId]);

  async function handleFetchHeadInvoicePayments(
    invoiceId: string | number,
    invoice?: ClientInvoiceRow
  ) {
    const finalInvoiceId = invoiceId || (invoice ? getInvoiceId(invoice) : "");

    if (!finalInvoiceId) {
      throw new Error("invoice_id is required");
    }

    return fetchHeadInvoicePayments(finalInvoiceId);
  }

  async function handleViewInvoice(invoice: ClientInvoiceRow) {
    const invoiceId = getInvoiceId(invoice);

    if (!invoiceId) {
      alert("Invoice ID missing. Cannot open invoice.");
      return;
    }

    try {
      setPaymentLoading(true);

      const paymentResponse = await fetchHeadInvoicePayments(invoiceId);
      const history = mapHeadInvoicePaymentsToHistory(paymentResponse);

      setSelectedInvoice({
        ...invoice,
        history,
      });
    } catch {
      setSelectedInvoice(invoice);
    } finally {
      setPaymentLoading(false);
    }
  }

 const handleDownloadInvoice = async (
  invoice: ClientInvoiceRow
) => {
  try {
    const invoiceId = getInvoiceId(invoice);

    if (!invoiceId) {
      alert("Invoice ID not found.");
      return;
    }

    await downloadHeadOfficeInvoicePdf(invoiceId);
  } catch (error: any) {
    console.error("Invoice download failed:", error);

    alert(
      error?.message ||
      "Failed to download invoice."
    );
  }
};

  return (
    <div className="w-full pb-8">
      <div className="mb-6 flex items-center gap-5">
        <Link
          href={`/head-office/ledger/${encodeURIComponent(storeCode)}`}
          className="flex h-[58px] w-[58px] items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-white text-[#111827] shadow-[0px_3px_10px_rgba(15,23,42,0.03)]"
        >
          <ChevronLeft className="h-7 w-7" />
        </Link>

        <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[42px]">
          {customerName}
        </h1>
      </div>

      {paymentLoading ? (
        <div className="mb-5 rounded-[18px] border border-[#DBEAFE] bg-[#EFF6FF] px-5 py-4 text-[15px] font-semibold text-[#1D4ED8]">
          Loading invoice payments...
        </div>
      ) : null}

      {error ? (
        <div className="mb-8 rounded-[24px] border border-red-200 bg-red-50 p-5 text-[15px] font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-[31px] border border-[#E5E7EB] bg-white p-6 text-[15px] font-medium text-[#6B7280] shadow-[1px_1px_4px_0px_rgba(0,0,0,0.10)]">
          Loading customer invoices...
        </div>
      ) : (
        <ClientLedgerTable
          rows={rows}
          onViewInvoice={handleViewInvoice}
          onFetchPayments={handleFetchHeadInvoicePayments}
          onDownloadInvoice={handleDownloadInvoice}
        />
      )}
    </div>
  );
}