"use client";

import { useEffect, useMemo, useState } from "react";
import FinanceSearchBar from "./FinanceSearchBar";
import LedgerTable from "./LedgerTable";
import { getLedgerInvoiceList } from "./api";
import { LedgerClientRow } from "./types";
import { mapLedgerListToClients } from "./utils";

export default function LedgerListContent() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<LedgerClientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);

        const res = await getLedgerInvoiceList({
          search: search.trim() || undefined,
        });

        if (!active) return;
        setRows(mapLedgerListToClients(res));
      } catch (error) {
        console.error("Failed to load ledger clients:", error);
        if (!active) return;
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [search]);

  const mappedRows = useMemo(() => rows, [rows]);

  return (
    <div className="space-y-6">
      <FinanceSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by name..."
      />

      {loading ? (
        <div className="rounded-[24px] border border-[#E3E6EB] bg-white p-6 text-[15px] font-medium text-[#6B7280] shadow-[0px_3px_12px_rgba(15,23,42,0.03)]">
          Loading clients...
        </div>
      ) : (
        <LedgerTable rows={mappedRows} />
      )}
    </div>
  );
}