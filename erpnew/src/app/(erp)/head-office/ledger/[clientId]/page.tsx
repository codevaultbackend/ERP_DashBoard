"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import ClientLedgerTable from "../../../../../features/retail/ledger/ClientLedgerTable";
import InvoicePreviewModal from "../../../../../features/retail/ledger/InvoicePreviewModal";
import { clientInvoices } from "../../../../../features/retail/data/data";
import { ClientInvoiceRow } from "../../../../../features/retail/data/types";

export default function LedgerClientDetailPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoiceRow | null>(null);

  const rows = useMemo(() => clientInvoices, []);

  return (
    <div className="w-full pb-8">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/retail/ledger"
          className="flex h-[58px] w-[58px] items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-white text-[#111827] shadow-[0px_3px_10px_rgba(15,23,42,0.03)]"
        >
          <ArrowLeft className="h-7 w-7" />
        </Link>

        <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[42px]">
          Johan Betley
        </h1>
      </div>

      <ClientLedgerTable rows={rows} onViewInvoice={setSelectedInvoice} />

      <InvoicePreviewModal
        open={!!selectedInvoice}
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}