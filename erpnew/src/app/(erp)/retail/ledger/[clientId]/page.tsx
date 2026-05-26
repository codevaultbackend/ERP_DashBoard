"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import ClientLedgerTable from "../../../../../features/retail/ledger/ClientLedgerTable";

import {
  getPaymentsByCustomer,
} from "../../../../../features/retail/ledger/api";

import {
  downloadHeadInvoicePdf,
} from "../../../../../features/retail/ledger/head-ledger-api";

import type {
  ClientInvoiceRow,
} from "../../../../../features/retail/ledger/types";

import {
  mapCustomerLedgerToUi,
} from "../../../../../features/retail/ledger/utils";

import { FaChevronLeft } from "react-icons/fa";

function getInvoiceId(
  invoice: ClientInvoiceRow & any
) {
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

export default function LedgerClientDetailPage() {

  const params =
    useParams<{
      clientId: string;
    }>();

  const customerId =
    params?.clientId ?? "";

  const [rows, setRows] =
    useState<ClientInvoiceRow[]>([]);

  const [
    customerName,
    setCustomerName,
  ] = useState("Customer");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {

    let active = true;

    async function loadCustomerLedger() {

      try {

        setLoading(true);
        setError("");

        if (
          !customerId ||
          !String(customerId).trim()
        ) {

          throw new Error(
            "Customer ID is missing."
          );
        }

        const res =
          await getPaymentsByCustomer(
            customerId
          );

        if (!active) {
          return;
        }

        if (!res?.success) {

          throw new Error(
            res?.message ||
            "Failed to load customer ledger."
          );
        }

        const mapped =
          mapCustomerLedgerToUi(
            res
          );

        setRows(
          mapped?.data ?? []
        );

        setCustomerName(
          mapped?.customer?.name ||
          mapped?.customer?.customer_name ||
          mapped?.customer?.client_name ||
          "Customer"
        );

      } catch (error) {

        console.error(
          "Failed to load customer ledger:",
          error
        );

        if (!active) {
          return;
        }

        setRows([]);

        setCustomerName(
          "Customer"
        );

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading customer invoices."
        );

      } finally {

        if (active) {
          setLoading(false);
        }
      }
    }

    loadCustomerLedger();

    return () => {
      active = false;
    };

  }, [customerId]);

  /**
   * DIRECT DOWNLOAD FLOW
   */
  const handleDownloadInvoice =
    async (
      invoice: ClientInvoiceRow
    ) => {

      try {

        const invoiceId =
          getInvoiceId(invoice);

        if (!invoiceId) {

          console.error(
            "Invoice ID missing:",
            invoice
          );

          alert(
            "Invoice ID missing."
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
    <div className="w-full pb-8">

      <div className="mb-6 flex items-center gap-4">

        <Link
          href="/retail/ledger"
          className="flex h-[50px] w-[50px] items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-white text-[#111827] shadow-[0px_3px_10px_rgba(15,23,42,0.03)]"
        >
          <FaChevronLeft className="h-5 w-5" />
        </Link>

        <h1 className="text-[30px] font-semibold tracking-[0.4px] text-[#101828] leading-[36px]">

          {loading
            ? "Loading..."
            : customerName}

        </h1>
      </div>

      {loading ? (

        <div className="rounded-[28px] border border-[#E0E3E8] bg-white px-6 py-8 text-center text-[16px] font-medium text-[#5B6475] shadow-[0px_3px_14px_rgba(15,23,42,0.03)]">

          Loading customer invoices...

        </div>

      ) : error ? (

        <div className="rounded-[28px] border border-[#F3D2D2] bg-[#FFF7F7] px-6 py-8 shadow-[0px_3px_14px_rgba(15,23,42,0.03)]">

          <h3 className="text-[16px] font-semibold text-[#B42318]">

            Failed to load customer ledger

          </h3>

          <p className="mt-2 text-[14px] text-[#7A271A]">

            {error}

          </p>
        </div>

      ) : rows.length === 0 ? (

        <div className="rounded-[28px] border border-[#E0E3E8] bg-white px-6 py-8 text-center text-[16px] font-medium text-[#5B6475] shadow-[0px_3px_14px_rgba(15,23,42,0.03)]">

          No invoices found for this customer.

        </div>

      ) : (

        <ClientLedgerTable
          rows={rows}
          onDownloadInvoice={
            handleDownloadInvoice
          }
        />

      )}
    </div>
  );
}