"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ClientLedgerTable from "../../../../../features/retail/ledger/ClientLedgerTable";
import InvoicePreviewModal from "../../../../../features/retail/ledger/InvoicePreviewModal";
import { getPaymentsByCustomerByRole } from "../../../../../features/retail/ledger/api";
import type { ClientInvoiceRow } from "../../../../../features/retail/ledger/types";
import { mapCustomerLedgerToUi } from "../../../../../features/retail/ledger/utils";

function isValidValue(value: unknown) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    value !== "undefined" &&
    value !== "null"
  );
}

function getParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function getLedgerBasePathFromPathname(pathname: string | null) {
  if (!pathname) return "/retail/ledger";

  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "");
  const parts = cleanPath.split("/").filter(Boolean);

  const ledgerIndex = parts.findIndex((part) => part === "ledger");

  if (ledgerIndex >= 0) {
    return `/${parts.slice(0, ledgerIndex + 1).join("/")}`;
  }

  const lowerParts = parts.map((part) => part.toLowerCase());

  if (lowerParts.includes("district")) return "/district/ledger";
  if (lowerParts.includes("retail")) return "/retail/ledger";

  if (
    lowerParts.includes("headoffice") ||
    lowerParts.includes("head-office") ||
    lowerParts.includes("head_office") ||
    lowerParts.includes("head")
  ) {
    const headPart =
      parts.find((part) =>
        ["headoffice", "head-office", "head_office", "head"].includes(
          part.toLowerCase()
        )
      ) || "headoffice";

    return `/${headPart}/ledger`;
  }

  return "/retail/ledger";
}

function getClientIdFromPathname(pathname: string | null) {
  if (!pathname) return "";

  const parts = pathname.split("?")[0].split("/").filter(Boolean);
  const last = parts.at(-1);

  return isValidValue(last) ? String(last) : "";
}

export default function LedgerClientDetailPage() {
  const params = useParams();
  const pathname = usePathname();

  const clientId = useMemo(() => {
    const idFromParams =
      getParamValue(params?.clientId as string | string[] | undefined) ||
      getParamValue(params?.customerId as string | string[] | undefined) ||
      getParamValue(params?.customer_id as string | string[] | undefined) ||
      getParamValue(params?.id as string | string[] | undefined) ||
      "";

    if (isValidValue(idFromParams)) {
      return String(idFromParams);
    }

    return getClientIdFromPathname(pathname);
  }, [params, pathname]);

  const backPath = useMemo(
    () => getLedgerBasePathFromPathname(pathname),
    [pathname]
  );

  const [selectedInvoice, setSelectedInvoice] =
    useState<ClientInvoiceRow | null>(null);
  const [rows, setRows] = useState<ClientInvoiceRow[]>([]);
  const [customerName, setCustomerName] = useState("Customer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCustomerLedger() {
      try {
        setLoading(true);
        setError("");

        if (!isValidValue(clientId)) {
          throw new Error("Client ID is missing.");
        }

        const res = await getPaymentsByCustomerByRole(clientId);

        if (!active) return;

        if (!res?.success) {
          throw new Error(res?.message || "Failed to load customer ledger.");
        }

        const mapped = mapCustomerLedgerToUi(res);

        setRows(mapped.data ?? []);
        setCustomerName(mapped.customer?.name || "Customer");
      } catch (error) {
        console.error("Customer ledger detail error:", error);

        if (!active) return;

        setRows([]);
        setCustomerName("Customer");
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading customer invoices."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCustomerLedger();

    return () => {
      active = false;
    };
  }, [clientId]);

  return (
    <div className="w-full pb-8 font-erp">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={backPath}
          className="flex h-[58px] w-[58px] items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-white text-[#111827] shadow-[0px_3px_10px_rgba(15,23,42,0.03)] transition hover:bg-[#F8FAFC]"
        >
          <ArrowLeft className="h-7 w-7" />
        </Link>

        <div className="min-w-0">
          <h1 className="truncate text-[34px] font-semibold leading-[42px] tracking-[-0.04em] text-[#111827] sm:text-[42px] sm:leading-[50px]">
            {loading ? "Loading..." : customerName}
          </h1>
        </div>
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
          <p className="mt-2 text-[14px] text-[#7A271A]">{error}</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[28px] border border-[#E0E3E8] bg-white px-6 py-8 text-center text-[16px] font-medium text-[#5B6475] shadow-[0px_3px_14px_rgba(15,23,42,0.03)]">
          No invoices found for this customer.
        </div>
      ) : (
        <ClientLedgerTable rows={rows} onViewInvoice={setSelectedInvoice} />
      )}

      <InvoicePreviewModal
        open={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}