"use client";

import {
  BarChart3,
  DollarSign,
  Download,
  Search,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FinanceMetricCard from "../../../../features/retail/ledger/FinanceMetricCard";
import HeadLedgerStoreTable from "../../../../features/retail/ledger/HeadLedgerStoreTable";
import {
  exportHeadCompleteLedgerExcel,
  fetchHeadLedgerStores,
} from "../../../../features/retail/ledger/head-ledger-api";
import { mapHeadStoresToLedgerRows } from "../../../../features/retail/ledger/head-ledger-utils";
import type { HeadLedgerStoreRow } from "../../../../features/retail/ledger/types";

export default function HeadOfficeLedgerPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<HeadLedgerStoreRow[]>([]);
  const [summary, setSummary] = useState({
    totalSales: "₹0",
    loss: "₹0",
    totalProfit: "₹0",
    totalRevenue: "₹0",
    collectableAmount: "₹0",
  });

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHeadLedger() {
      try {
        setLoading(true);
        setError("");

        const response = await fetchHeadLedgerStores();
        const mapped = mapHeadStoresToLedgerRows(response);

        if (!active) return;

        setRows(mapped.rows || []);
        setSummary({
          totalSales: mapped.summary?.totalSales || "₹0",
          loss: mapped.summary?.loss || "₹0",
          totalProfit: mapped.summary?.totalProfit || "₹0",
          totalRevenue: mapped.summary?.totalRevenue || "₹0",
          collectableAmount: mapped.summary?.collectableAmount || "₹0",
        });
      } catch (err) {
        if (!active) return;

        setRows([]);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch head office ledger"
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHeadLedger();

    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return rows;

    return rows.filter((item) => {
      return (
        String(item.storeCode || "").toLowerCase().includes(q) ||
        String(item.storeName || "").toLowerCase().includes(q) ||
        String(item.storeManager || "").toLowerCase().includes(q) ||
        String(item.organizationLevel || "").toLowerCase().includes(q)
      );
    });
  }, [rows, search]);

  async function handleExport() {
    try {
      setExporting(true);
      await exportHeadCompleteLedgerExcel();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to export report");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="min-h-screen w-full bg-[#F5F6F8] font-erp text-[#111827]">
      <section className="mx-auto w-full max-w-[1540px] px-4 py-5 sm:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-0">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.04em] text-[#111827] sm:text-[36px] sm:leading-[44px] xl:text-[42px] xl:leading-[52px]">
              Ledger &amp; Accounts
            </h1>

            <p className="mt-1.5 max-w-[650px] text-[15px] font-normal leading-[22px] tracking-[-0.02em] text-[#5B6475] sm:text-[17px] sm:leading-[24px] xl:text-[18px]">
              Complete financial tracking and product-wise ledger
            </p>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#02031A] px-6 text-[15px] font-medium leading-[20px] tracking-[-0.03em] text-white shadow-[0px_10px_24px_rgba(2,3,26,0.18)] transition hover:-translate-y-[1px] hover:bg-[#070826] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[176px] xl:h-[56px] xl:px-[30px] xl:text-[16px]"
          >
            <Download className="h-4 w-4" />
            {exporting ? "Exporting..." : "Export Report"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:mt-[28px] xl:grid-cols-5 xl:gap-[20px]">
          <FinanceMetricCard
            title="Total Sales"
            value={summary.totalSales}
            icon={<BarChart3 className="h-6 w-6 text-[#3B82F6]" />}
            iconWrapClassName="bg-[#DCEBFA]"
          />

          <FinanceMetricCard
            title="Loss"
            value={summary.loss}
            icon={<TrendingDown className="h-6 w-6 text-[#FF3131]" />}
            iconWrapClassName="bg-[#F9E2E2]"
          />

          <FinanceMetricCard
            title="Total Profit"
            value={summary.totalProfit}
            icon={<Wallet className="h-6 w-6 text-[#16A34A]" />}
            iconWrapClassName="bg-[#DCFCE7]"
          />

          <FinanceMetricCard
            title="Total Revenue"
            value={summary.totalRevenue}
            icon={<TrendingUp className="h-6 w-6 text-[#B56BFF]" />}
            iconWrapClassName="bg-[#F3E8FF]"
          />

          <FinanceMetricCard
            title="Collectable Amount"
            value={summary.collectableAmount}
            icon={<DollarSign className="h-6 w-6 text-[#B38300]" />}
            iconWrapClassName="bg-[#F7E8BA]"
          />
        </div>

        <div className="mt-6 rounded-[28px] border border-[#E5E7EB] bg-white px-4 py-3 shadow-[0px_2px_8px_rgba(15,23,42,0.04)] sm:rounded-[34px] sm:px-5 sm:py-4 xl:mt-[28px]">
          <div className="flex h-[48px] w-full max-w-full items-center gap-3 rounded-full bg-[#F7F7F8] px-4 sm:h-[54px] sm:max-w-[840px] sm:px-5">
            <Search className="h-5 w-5 shrink-0 text-[#98A2B3]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, store code..."
              className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-normal tracking-[-0.02em] text-[#111827] outline-none placeholder:text-[#667085] sm:text-[16px]"
            />
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 p-5 text-[15px] font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5">
          {loading ? (
            <div className="rounded-[28px] border border-[#E5E7EB] bg-white p-6 text-[15px] font-medium text-[#6B7280] shadow-[1px_1px_4px_0px_rgba(0,0,0,0.10)] sm:rounded-[31px]">
              Loading head office ledger...
            </div>
          ) : (
            <HeadLedgerStoreTable rows={filteredRows} />
          )}
        </div>
      </section>
    </main>
  );
}