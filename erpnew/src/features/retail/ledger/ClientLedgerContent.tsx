"use client";

import { useEffect, useState } from "react";
import ClientLedgerTable from "./ClientLedgerTable";
import InvoicePreviewModal from "./InvoicePreviewModal";
import { getPaymentsByCustomer } from "./api";
import { ClientInvoiceRow } from "./types";
import { mapCustomerLedgerToUi } from "./utils";

type Props = {
  customerId: string;
};

export default function ClientLedgerContent({ customerId }: Props) {
  const [rows, setRows] = useState<ClientInvoiceRow[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoiceRow | null>(
    null
  );
  const [openPreview, setOpenPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const res = await getPaymentsByCustomer(customerId);

        if (!active) return;

        const mapped = mapCustomerLedgerToUi(res);
        setRows(mapped.data);
      } catch (error) {
        console.error("Failed to load customer ledger:", error);
        if (!active) return;
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (customerId) {
      load();
    }

    return () => {
      active = false;
    };
  }, [customerId]);

  const handleViewInvoice = (invoice: ClientInvoiceRow) => {
    setSelectedInvoice(invoice);
    setOpenPreview(true);
  };

  return (
    <>
      {loading ? (
        <div className="rounded-[24px] border border-[#E3E6EB] bg-white p-6 text-[15px] font-medium text-[#6B7280] shadow-[0px_3px_12px_rgba(15,23,42,0.03)]">
          Loading customer invoices...
        </div>
      ) : (
        <ClientLedgerTable rows={rows} onViewInvoice={handleViewInvoice} />
      )}

      <InvoicePreviewModal
        open={openPreview}
        invoice={selectedInvoice}
        onClose={() => setOpenPreview(false)}
      />
    </>
  );
}