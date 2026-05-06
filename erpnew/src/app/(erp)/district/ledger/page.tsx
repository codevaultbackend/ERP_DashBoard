"use client";

import { BarChart3, Search, TrendingDown, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FinanceMetricCard from "../../../../features/retail/ledger/FinanceMetricCard";
import FinanceSearchBar from "../../../../features/retail/ledger/FinanceSearchBar";
import LedgerTable from "../../../../features/retail/ledger/LedgerTable";
import { getLedgerDashboardByRole } from "../../../../features/retail/ledger/api";
import type {
  LedgerClientRow,
  LedgerDashboardSummary,
} from "../../../../features/retail/ledger/types";
import {
  downloadCsv,
  mapLedgerClientsToUi,
  toNumber,
} from "../../../../features/retail/ledger/utils";

const EMPTY_SUMMARY: LedgerDashboardSummary = {
  total_sales: 0,
  loss: 0,
  goods_receipt: 0,
};

function formatMetricValue(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

function parseAmount(value: string | number | null | undefined) {
  if (typeof value === "number") return value;

  const text = String(value ?? "").trim();

  if (!text) return 0;

  const hasLakh = /L$/i.test(text);
  const cleaned = text.replace(/[₹,\s]/g, "").replace(/L$/i, "");
  const num = Number(cleaned);

  if (Number.isNaN(num)) return 0;

  return hasLakh ? num * 100000 : num;
}

export default function LedgerPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<LedgerClientRow[]>([]);
  const [summary, setSummary] =
    useState<LedgerDashboardSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadLedger() {
      try {
        setLoading(true);
        setError("");

        const res = await getLedgerDashboardByRole(search.trim());

        if (!active) return;

        if (!res?.success) {
          throw new Error(res?.message || "Failed to load ledger dashboard.");
        }

        setSummary(res?.data?.summary ?? EMPTY_SUMMARY);
        setRows(mapLedgerClientsToUi(res));
      } catch (err) {
        console.error("Ledger dashboard error:", err);

        if (!active) return;

        setRows([]);
        setSummary(EMPTY_SUMMARY);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading ledger data."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLedger();

    return () => {
      active = false;
    };
  }, [search]);

  const filteredRows = useMemo(() => rows, [rows]);

  const collectableAmount = useMemo(() => {
    return rows.reduce((sum, item) => {
      return sum + parseAmount(item.pendingAmount);
    }, 0);
  }, [rows]);

  const handleExportReport = () => {
    if (!filteredRows.length) return;

    downloadCsv(
      "ledger-report.csv",
      filteredRows.map((row) => ({
        "Client Name": row.clientName,
        "Total Deals": row.totalDeals,
        "Total Amount": row.totalAmount,
        "Received Amount": row.receivedAmount,
        "Pending Amount": row.pendingAmount,
      }))
    );
  };

  return (
    <div className="w-full pb-8 font-erp">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-[42px] tracking-[-0.04em] text-[#111827] sm:text-[42px] sm:leading-[50px]">
            Ledger &amp; Accounts
          </h1>

          <p className="mt-2 text-[18px] font-normal leading-[24px] tracking-[-0.02em] text-[#5B6475]">
            Complete financial tracking and product-wise ledger
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportReport}
          disabled={!filteredRows.length}
          className="inline-flex h-[56px] items-center justify-center gap-3 rounded-full bg-[#02031A] px-6 text-[16px] font-medium leading-[20px] tracking-[-0.02em] text-white shadow-[0px_10px_24px_rgba(2,3,26,0.18)] transition hover:bg-[#11122A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search className="h-4 w-4 rotate-45" strokeWidth={2.2} />
          Export Report
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <FinanceMetricCard
          title="Total Sales"
          value={formatMetricValue(summary.total_sales)}
          icon={<BarChart3 className="h-6 w-6 text-[#3B82F6]" />}
          iconWrapClassName="bg-[#DCEBFA]"
        />

        <FinanceMetricCard
          title="Total Loss"
          value={formatMetricValue(summary.loss)}
          icon={<TrendingDown className="h-6 w-6 text-[#FF3131]" />}
          iconWrapClassName="bg-[#F9E2E2]"
        />

        <FinanceMetricCard
          title="Collectable Amount"
          value={formatMetricValue(collectableAmount)}
          icon={<Wallet className="h-6 w-6 text-[#B38300]" />}
          iconWrapClassName="bg-[#F7E8BA]"
        />
      </div>

      <div className="mt-8">
        <FinanceSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by name..."
        />
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="rounded-[24px] border border-[#E3E6EB] bg-white p-6 text-[15px] font-medium text-[#6B7280] shadow-[0px_3px_12px_rgba(15,23,42,0.03)]">
            Loading ledger data...
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-[#F3D2D2] bg-[#FFF7F7] p-6 shadow-[0px_3px_12px_rgba(15,23,42,0.03)]">
            <h3 className="text-[16px] font-semibold text-[#B42318]">
              Failed to load ledger
            </h3>
            <p className="mt-2 text-[14px] text-[#7A271A]">{error}</p>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="rounded-[24px] border border-[#E3E6EB] bg-white p-6 text-[15px] font-medium text-[#6B7280] shadow-[0px_3px_12px_rgba(15,23,42,0.03)]">
            No ledger clients found.
          </div>
        ) : (
          <LedgerTable rows={filteredRows} />
        )}
      </div>
    </div>
  );
}