"use client";

import { useEffect, useMemo, useState } from "react";
import FinanceSearchBar from "../../../../features/retail/ledger/FinanceSearchBar";
import LedgerTable from "../../../../features/retail/ledger/LedgerTable";
import { getLedgerDashboard } from "../../../../features/retail/ledger/api";
import type {
  LedgerClientRow,
  LedgerDashboardSummary,
} from "../../../../features/retail/ledger/types";
import {
  formatCurrency,
  mapLedgerClientsToUi,
} from "../../../../features/retail/ledger/utils";
import FinanceMetricCard from "../../../../features/retail/ledger/FinanceMetricCard";
import {
  BadgeIndianRupee,
  ReceiptText,
  Wallet2,
} from "lucide-react";

const EMPTY_SUMMARY: LedgerDashboardSummary = {
  total_sales: 0,
  loss: 0,
  goods_receipt: 0,
};

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

        const apiSummary = res?.data?.summary ?? EMPTY_SUMMARY;
        const apiClients = res?.data?.clients ?? [];

        setSummary(apiSummary);
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
        value: formatCurrency(summary.total_sales),
        icon: (
          <BadgeIndianRupee
            className="h-5 w-5 text-[#2563EB]"
            strokeWidth={2.2}
          />
        ),
        iconWrapClassName: "bg-[#DBEAFE]",
      },
      {
        title: "Loss",
        value: formatCurrency(summary.loss),
        icon: <Wallet2 className="h-5 w-5 text-[#DC2626]" strokeWidth={2.2} />,
        iconWrapClassName: "bg-[#FEE2E2]",
      },
      {
        title: "Goods Receipt",
        value: formatCurrency(summary.goods_receipt),
        icon: (
          <ReceiptText
            className="h-5 w-5 text-[#16A34A]"
            strokeWidth={2.2}
          />
        ),
        iconWrapClassName: "bg-[#DCFCE7]",
      },
    ],
    [summary]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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

      <FinanceSearchBar
        value={search}
        onChange={setSearch}
        placeholder="Search by client name..."
      />

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
      ) : rows.length === 0 ? (
        <div className="rounded-[24px] border border-[#E3E6EB] bg-white p-6 text-[15px] font-medium text-[#6B7280] shadow-[0px_3px_12px_rgba(15,23,42,0.03)]">
          No ledger clients found.
        </div>
      ) : (
        <LedgerTable rows={rows} />
      )}
    </div>
  );
}