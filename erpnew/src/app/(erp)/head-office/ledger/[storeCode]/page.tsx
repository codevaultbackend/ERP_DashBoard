"use client";

import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FinanceSearchBar from "../../../../../features/retail/ledger/FinanceSearchBar";
import HeadLedgerCustomerTable from "../../../../../features/retail/ledger/HeadLedgerCustomerTable";
import {
  exportHeadStoreLedgerExcel,
  fetchHeadStoreCustomers,
} from "../../../../../features/retail/ledger/head-ledger-api";
import type { HeadLedgerCustomerRow } from "../../../../../features/retail/ledger/types";
import { mapHeadStoreCustomersToLedgerRows } from "../../../../../features/retail/ledger/head-ledger-utils";

export default function HeadOfficeStoreLedgerPage() {
  const params = useParams();
  const storeCode = decodeURIComponent(String(params?.storeCode || ""));

  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<HeadLedgerCustomerRow[]>([]);
  const [storeName, setStoreName] = useState(storeCode);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStoreCustomers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetchHeadStoreCustomers(storeCode);
        const mapped = mapHeadStoreCustomersToLedgerRows(response, storeCode);

        if (!active) return;

        setRows(mapped.rows);

        const firstCustomerStoreName =
          mapped.store?.store_name ||
          mapped.store?.storeName ||
          mapped.store?.name;

        setStoreName(firstCustomerStoreName || storeCode);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error ? err.message : "Failed to fetch store customers"
        );
        setRows([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (storeCode) loadStoreCustomers();

    return () => {
      active = false;
    };
  }, [storeCode]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return rows;

    return rows.filter((item) => {
      return (
        item.clientName.toLowerCase().includes(q) ||
        item.customerId.toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  async function handleExportStore() {
    try {
      setExporting(true);
      await exportHeadStoreLedgerExcel(storeCode);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to export store ledger");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="w-full pb-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-5">
          <Link
            href="/head-office/ledger"
            className="flex h-[56px] w-[56px] items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-white text-[#111827] shadow-[0px_3px_10px_rgba(15,23,42,0.03)]"
          >
            <ArrowLeft className="h-7 w-7" />
          </Link>

          <div>
            <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[40px]">
              {storeName}
            </h1>
            <p className="mt-1 text-[15px] font-medium text-[#667085]">
              Store Code: {storeCode}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportStore}
          disabled={exporting}
          className="inline-flex h-[52px] items-center justify-center gap-3 rounded-full bg-[#02031A] px-6 text-[15px] font-medium text-white shadow-[0px_10px_24px_rgba(2,3,26,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Exporting..." : "Export Store Ledger"}
        </button>
      </div>

      <FinanceSearchBar value={search} onChange={setSearch} />

      {error ? (
        <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 p-5 text-[15px] font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-5">
        {loading ? (
          <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 text-[15px] font-medium text-[#6B7280] shadow-[0px_6px_20px_rgba(15,23,42,0.06)]">
            Loading store customers...
          </div>
        ) : (
          <HeadLedgerCustomerTable rows={filteredRows} />
        )}
      </div>
    </div>
  );
}