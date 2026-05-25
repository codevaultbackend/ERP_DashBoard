
"use client";

import {
  Download,
  DollarSign,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FinanceMetricCard from "../../../../../features/retail/ledger/FinanceMetricCard";
import LedgerTable from "../../../../../features/retail/ledger/LedgerTable";
import { getLedgerDashboard } from "../../../../../features/retail/ledger/api";
import type {
  LedgerClientRow,
  LedgerDashboardSummary,
} from "../../../../../features/retail/ledger/types";
import {
  downloadCsv,
  mapLedgerClientsToUi,
  toNumber,
} from "../../../../../features/retail/ledger/utils";

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

export default function PendingAmount() {

     const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [rows, setRows] = useState<LedgerClientRow[]>([]);
  const [summary, setSummary] = useState<LedgerDashboardSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Prevent API hit on every key press
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;

    async function loadLedger() {
      try {
        setLoading(true);
        setError("");

        const res = await getLedgerDashboard(debouncedSearch);

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
  }, [debouncedSearch]);

  const metricCards = useMemo(
    () => [
      {
        title: "Total Sales",
        value: formatPlainMetric(summary.total_sales),
        icon: (
          <TrendingUp
            className="h-[21px] w-[21px] sm:h-[23px] sm:w-[23px] text-[#2F80ED]"
            strokeWidth={2.1}
          />
        ),
        iconWrapClassName: "bg-[#DBECFF]",
      },
      {
        title: "Total Loss",
        value: formatPlainMetric(summary.loss),
        icon: (
          <TrendingDown
            className="h-[21px] w-[21px] sm:h-[23px] sm:w-[23px] text-[#FF1F1F]"
            strokeWidth={2.1}
          />
        ),
        iconWrapClassName: "bg-[#FFE3E5]",
      },
      {
        title: "Collectable Amount",
        value: formatPlainMetric(summary.goods_receipt),
        icon: (
          <DollarSign
            className="h-[22px] w-[22px] sm:h-[24px] sm:w-[24px] text-[#B98500]"
            strokeWidth={2.1}
          />
        ),
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
        <>

            <section className="w-full min-w-0 font-erp">
                {/* Header */}
                <div className="flex w-full flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="erp-page-title text-[26px] leading-[32px] tracking-[-0.03em] sm:text-[32px] sm:leading-[38px] lg:text-[36px] lg:leading-[42px]">
                            Ledger &amp; Accounts
                        </h1>

                        <p className="mt-[6px] max-w-[620px] text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-[#526173] sm:text-[16px] sm:leading-[22px] lg:text-[18px] lg:leading-[24px]">
                            Complete financial tracking and product-wise ledger
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={!rows.length}
                        className="inline-flex h-[44px] w-full items-center justify-center gap-[10px] rounded-erp-full bg-[#030314] px-[20px] text-[14px] font-semibold leading-[18px] tracking-[-0.02em] text-white transition hover:bg-[#111122] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[46px] sm:w-auto sm:min-w-[191px] sm:text-[16px] sm:leading-[20px] lg:mt-[8px]"
                    >
                        <Download className="h-[16px] w-[16px] shrink-0" strokeWidth={2.2} />
                        Export Report
                    </button>
                </div>

                {/* Metric Cards */}
                <div className="mt-[22px] grid grid-cols-2 gap-4 sm:mt-[28px] sm:gap-5 xl:grid-cols-3 xl:gap-[27px]">
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

                {/* Search */}
                <div className="mt-[22px] flex min-h-[64px] w-full items-center rounded-[28px] border border-[#E1E5EA] bg-white px-[12px] shadow-[1px_1px_4px_0px_rgba(0,0,0,0.04)] sm:mt-[27px] sm:h-[76px] sm:max-w-[925px] sm:rounded-[38px] sm:px-[18px]">
                    <div className="flex h-[42px] w-full items-center gap-[10px] rounded-[24px] bg-[#F8F8F8] px-[14px] sm:h-[40px] sm:gap-[12px] sm:px-[17px]">
                        <Search
                            className="h-[18px] w-[18px] shrink-0 text-[#8A94A6]"
                            strokeWidth={2}
                        />

                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search by name..."
                            className="h-full min-w-0 flex-1 bg-transparent text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-[#101828] outline-none placeholder:text-[#6B7280] sm:text-[16px]"
                            autoComplete="off"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="mt-[22px] min-w-0 sm:mt-[27px]">
                    {loading ? (
                        <div className="rounded-[22px] border border-erp-border bg-white p-5 text-[14px] font-medium text-erp-muted shadow-erp-card sm:rounded-[28px] sm:p-6 sm:text-[15px]">
                            Loading ledger data...
                        </div>
                    ) : error ? (
                        <div className="rounded-[22px] border border-[#F3D2D2] bg-[#FFF7F7] p-5 shadow-erp-card sm:rounded-[28px] sm:p-6">
                            <h3 className="text-[15px] font-semibold text-[#B42318] sm:text-[16px]">
                                Failed to load ledger
                            </h3>
                            <p className="mt-2 break-words text-[13px] leading-[19px] text-[#7A271A] sm:text-[14px]">
                                {error}
                            </p>
                        </div>
                    ) : rows.length === 0 ? (
                        <div className="rounded-[22px] border border-erp-border bg-white p-5 text-[14px] font-medium text-erp-muted shadow-erp-card sm:rounded-[28px] sm:p-6 sm:text-[15px]">
                            No ledger clients found.
                        </div>
                    ) : (
                        <div className="w-full min-w-0 overflow-hidden rounded-[22px] sm:rounded-[28px]">
                            <div className="w-full overflow-x-auto dashboard-hidden-scroll">
                                <div className="min-w-[760px]">
                                    <LedgerTable rows={rows} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>


        </>
    )
}