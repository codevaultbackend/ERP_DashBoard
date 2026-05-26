"use client";

import { useEffect, useState } from "react";

import ClientLedgerTable from "./ClientLedgerTable";

import {
  getPaymentsByCustomer,
} from "./api";

import {
  downloadHeadInvoicePdf,
} from "./head-ledger-api";

import type {
  ClientInvoiceRow,
} from "./types";

import {
  mapCustomerLedgerToUi,
} from "./utils";

import InvoicePreviewModal from "./InvoicePreviewModal";

type Props = {
  customerId: string;
};

export default function ClientLedgerContent({
  customerId,
}: Props) {

  const [rows, setRows] =
    useState<ClientInvoiceRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  /**
   * MODAL STATES
   */
  const [
    previewOpen,
    setPreviewOpen,
  ] = useState(false);

  const [
    selectedInvoice,
    setSelectedInvoice,
  ] = useState<ClientInvoiceRow | null>(null);

  useEffect(() => {

    let active = true;

    async function load() {

      try {

        setLoading(true);

        const res =
          await getPaymentsByCustomer(
            customerId
          );

        if (!active) return;

        const mapped =
          mapCustomerLedgerToUi(res);

        setRows(mapped?.data || []);

      } catch (error) {

        console.error(
          "Failed to load customer ledger:",
          error
        );

        if (!active) return;

        setRows([]);

      } finally {

        if (active) {
          setLoading(false);
        }
      }
    }

    if (customerId) {
      load();
    }

    return () => {
      active = false;
    };

  }, [customerId]);

  /**
   * VIEW INVOICE
   */
  const handleViewInvoice =
    async (
      invoice: ClientInvoiceRow & any
    ) => {

      try {

        const invoiceId =
          invoice?.invoiceId ||
          invoice?.invoice_id ||
          invoice?.id ||
          invoice?.reference_id ||
          invoice?.referenceId ||
          invoice?.raw?.invoice_id ||
          invoice?.raw?.invoiceId ||
          invoice?.raw?.id ||
          null;

        if (
          !invoiceId ||
          invoiceId === "undefined" ||
          invoiceId === "null"
        ) {

          console.error(
            "Invoice ID missing:",
            invoice
          );

          alert(
            "Invoice ID not found."
          );

          return;
        }

        /**
         * OPEN MODAL
         */
        setSelectedInvoice({
          ...invoice,
          invoice_id: invoiceId,
          invoiceId: invoiceId,
          id: invoiceId,
        });

        setPreviewOpen(true);

      } catch (error) {

        console.error(
          "Invoice preview failed:",
          error
        );
      }
    };

  /**
   * DOWNLOAD
   */
  const handleDownloadInvoice =
    async (
      invoice: ClientInvoiceRow & any
    ) => {

      try {

        const invoiceId =
          invoice?.invoiceId ||
          invoice?.invoice_id ||
          invoice?.id ||
          invoice?.reference_id ||
          invoice?.referenceId ||
          invoice?.raw?.invoice_id ||
          invoice?.raw?.invoiceId ||
          invoice?.raw?.id ||
          null;

        if (
          !invoiceId ||
          invoiceId === "undefined" ||
          invoiceId === "null"
        ) {

          alert(
            "Invoice ID not found."
          );

          return;
        }

        await downloadHeadInvoicePdf(
          invoiceId
        );

      } catch (error: any) {

        console.error(
          "Invoice download failed:",
          error
        );

        alert(
          error?.message ||
          "Failed to download invoice."
        );
      }
    };

  return (
    <>
      {loading ? (

        <div className="rounded-[24px] border border-[#E3E6EB] bg-white p-6 text-[15px] font-medium text-[#6B7280] shadow-[0px_3px_12px_rgba(15,23,42,0.03)]">
          Loading customer invoices...
        </div>

      ) : (

        <ClientLedgerTable
          rows={rows}
          onViewInvoice={
            handleViewInvoice
          }
          onDownloadInvoice={
            handleDownloadInvoice
          }
        />

      )}

      {/* MODAL */}
      <InvoicePreviewModal
        open={previewOpen}
        invoice={selectedInvoice}
        onClose={() => {

          setPreviewOpen(false);

          setSelectedInvoice(null);
        }}
      />
    </>
  );
}