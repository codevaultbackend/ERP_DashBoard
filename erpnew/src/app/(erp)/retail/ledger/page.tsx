"use client";

import { Download, DollarSign, Search, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FinanceMetricCard from "../../../../features/retail/ledger/FinanceMetricCard";
import LedgerTable from "../../../../features/retail/ledger/LedgerTable";
import { getLedgerDashboard } from "../../../../features/retail/ledger/api";
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

function formatPlainMetric(value: number | string | null | undefined) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export default function LedgerPage() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<LedgerClientRow[]>([]);
  const [summary, setSummary] = useState<LedgerDashboardSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadLedger() {
      try {
        setLoading(true);
        setError("");

        const res = await getLedgerDashboard(search.trim());

        if (!active) return;

        if (!res?.success) {
          throw new Error(res?.message || "Failed to load ledger dashboard.");
        }

        setSummary(res?.data?.summary ?? EMPTY_SUMMARY);
        setRows(mapLedgerClientsToUi(res));
      } catch (err) {
        console.error("Ledger dashboard error:", err);

        if (!active) return;

        setSummary(EMPTY_SUMMARY);
        setRows([]);
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

  const metricCards = useMemo(
    () => [
      {
        title: "Total Sales",
        value: formatPlainMetric(summary.total_sales),
        icon: <TrendingUp className="h-[23px] w-[23px] text-[#2F80ED]" strokeWidth={2.1} />,
        iconWrapClassName: "bg-[#DBECFF]",
      },
      {
        title: "Total Loss",
        value: formatPlainMetric(summary.loss),
        icon: <TrendingDown className="h-[23px] w-[23px] text-[#FF1F1F]" strokeWidth={2.1} />,
        iconWrapClassName: "bg-[#FFE3E5]",
      },
      {
        title: "Collectable Amount",
        value: formatPlainMetric(summary.goods_receipt),
        icon: <DollarSign className="h-[24px] w-[24px] text-[#B98500]" strokeWidth={2.1} />,
        iconWrapClassName: "bg-[#FFF0C7]",
      },
    ],
    [summary]
  );

  const handleExport = () => {
    if (!rows.length) return;

    downloadCsv(
      "ledger-report.csv",
      rows.map((row) => ({
        "Client Name": row.clientName,
        "Total Deals": row.totalDeals,
        "Total Amount": row.totalAmount,
        "Received Amount": row.receivedAmount,
        "Pending Amount": row.pendingAmount,
      }))
    );
  };

  return (
    <section className="w-full font-erp">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="erp-page-title">Ledger &amp; Accounts</h1>
          <p className="mt-[4px] text-[18px] font-normal leading-[24px] tracking-[-0.02em] text-[#526173]">
            Complete financial tracking and product-wise ledger
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={!rows.length}
          className="mt-[8px] inline-flex h-[46px] min-w-[191px] items-center justify-center gap-[10px] rounded-erp-full bg-[#030314] px-[24px] text-[16px] font-semibold leading-[20px] tracking-[-0.02em] text-white transition hover:bg-[#111122] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Download className="h-[16px] w-[16px]" strokeWidth={2.2} />
          Export Report
        </button>
      </div>

      <div className="mt-[31px] grid grid-cols-1 gap-[27px] md:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <FinanceMetricCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconWrapClassName={card.iconWrapClassName}
          />
        ))}
      </div>

      <div className="mt-[27px] flex h-[76px] w-full max-w-[925px] items-center rounded-[38px] border border-[#E1E5EA] bg-white px-[18px] shadow-[1px_1px_4px_0px_rgba(0,0,0,0.04)]">
        <div className="flex h-[40px] w-full items-center gap-[12px] rounded-[24px] bg-[#F8F8F8] px-[17px]">
          <Search className="h-[18px] w-[18px] text-[#8A94A6]" strokeWidth={2} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name..."
            className="h-full w-full bg-transparent text-[16px] font-normal leading-[20px] tracking-[-0.02em] text-[#101828] outline-none placeholder:text-[#6B7280]"
          />
        </div>
      </div>

      <div className="mt-[27px]">
        {loading ? (
          <div className="rounded-[28px] border border-erp-border bg-white p-6 text-[15px] font-medium text-erp-muted shadow-erp-card">
            Loading ledger data...
          </div>
        ) : error ? (
          <div className="rounded-[28px] border border-[#F3D2D2] bg-[#FFF7F7] p-6 shadow-erp-card">
            <h3 className="text-[16px] font-semibold text-[#B42318]">
              Failed to load ledger
            </h3>
            <p className="mt-2 text-[14px] text-[#7A271A]">{error}</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-[28px] border border-erp-border bg-white p-6 text-[15px] font-medium text-erp-muted shadow-erp-card">
            No ledger clients found.
          </div>
        ) : (
          <LedgerTable rows={rows} />
        )}
      </div>
    </section>
  );
}