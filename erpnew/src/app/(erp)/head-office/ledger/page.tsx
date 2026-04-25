"use client";

import { BarChart3, Search, TrendingDown, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import FinanceMetricCard from "../../../../features/retail/ledger/FinanceMetricCard";
import FinanceSearchBar from "../../../../features/retail/ledger/FinanceSearchBar";
import LedgerTable from "../../../../features/retail/ledger/LedgerTable";
import { ledgerClients, ledgerSummary } from "../../../../features/retail/data/data";

export default function LedgerPage() {
  const [search, setSearch] = useState("");

  const filteredRows = useMemo(() => {
    return ledgerClients.filter((item) =>
      item.clientName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <div className="w-full pb-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[42px]">
            Ledger &amp; Accounts
          </h1>
          <p className="mt-2 text-[18px] text-[#5B6475]">
            Complete financial tracking and product-wise ledger
          </p>
        </div>

        <button className="inline-flex h-[56px] items-center justify-center gap-3 rounded-full bg-[#02031A] px-6 text-[16px] font-medium text-white shadow-[0px_10px_24px_rgba(2,3,26,0.18)]">
          <Search className="h-4 w-4 rotate-45" />
          Export Report
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <FinanceMetricCard
          title="Total Sales"
          value={ledgerSummary.totalSales}
          icon={<BarChart3 className="h-6 w-6 text-[#3B82F6]" />}
          iconWrapClassName="bg-[#DCEBFA]"
        />
        <FinanceMetricCard
          title="Total Loss"
          value={ledgerSummary.totalLoss}
          icon={<TrendingDown className="h-6 w-6 text-[#FF3131]" />}
          iconWrapClassName="bg-[#F9E2E2]"
        />
        <FinanceMetricCard
          title="Collectable Amount"
          value={ledgerSummary.collectableAmount}
          icon={<Wallet className="h-6 w-6 text-[#B38300]" />}
          iconWrapClassName="bg-[#F7E8BA]"
        />
      </div>

      <div className="mt-8">
        <FinanceSearchBar value={search} onChange={setSearch} />
      </div>

      <div className="mt-8">
        <LedgerTable rows={filteredRows} />
      </div>
    </div>
  );
}