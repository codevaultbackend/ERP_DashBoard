"use client";

import {
  Download,
  Loader2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";


import {
  downloadHeadInvoicePdf,
  fetchHeadInvoicePayments,
} from "./head-ledger-api";

import type {
  ClientInvoiceRow,
} from "../data/types";

type Props = {
  open: boolean;
  invoice: ClientInvoiceRow | null;
  onClose: () => void;
};

export default function InvoicePreviewModal({
  open,
  invoice,
  onClose,
}: Props) {

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    invoiceData,
    setInvoiceData,
  ] = useState<any>(null);

  useEffect(() => {

    if (!open || !invoice) {
      return;
    }

    const onKeyDown = (
      e: KeyboardEvent
    ) => {

      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {

      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };

  }, [open, invoice, onClose]);

  /**
   * FETCH REAL INVOICE
   */
  useEffect(() => {

    async function loadInvoice() {

      try {

        if (!invoice) {
          return;
        }

        const invoiceId =
          invoice?.invoiceId ||
          invoice?.invoice_id ||
          invoice?.id ||
          invoice?.reference_id;

        if (!invoiceId) {
          return;
        }

        setLoading(true);

        /**
         * YOUR REAL API
         */
        const res =
          await fetchHeadInvoicePayments(
            invoiceId
          );

        setInvoiceData(
          res?.data || res
        );

      } catch (error) {

        console.error(
          "Invoice fetch failed:",
          error
        );

      } finally {

        setLoading(false);
      }
    }

    if (open && invoice) {
      loadInvoice();
    }

  }, [open, invoice]);

  /**
   * DOWNLOAD
   */
  const handleDownload =
    async () => {

      try {

        const invoiceId =
          invoice?.invoiceId ||
          invoice?.invoice_id ||
          invoice?.id ||
          invoice?.reference_id;

        if (!invoiceId) {
          return;
        }

        await downloadHeadInvoicePdf(
          invoiceId
        );

      } catch (error) {

        console.error(
          "Download failed:",
          error
        );
      }
    };

  if (!open || !invoice) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/35 backdrop-blur-[1px]">

      <div className="absolute right-4 top-4 flex items-center gap-3 sm:right-6 sm:top-6">

        <button
          onClick={
            handleDownload
          }
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white text-[#111827] shadow-[0px_8px_20px_rgba(15,23,42,0.15)]"
        >
          <Download className="h-5 w-5" />
        </button>

        <button
          onClick={onClose}
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white text-[#111827] shadow-[0px_8px_20px_rgba(15,23,42,0.15)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="h-full overflow-y-auto px-3 py-20 sm:px-6 lg:px-10">

        <div className="mx-auto w-full max-w-[1100px] bg-white shadow-[0px_22px_80px_rgba(15,23,42,0.18)]">

          
        </div>
      </div>
    </div>
  );
}