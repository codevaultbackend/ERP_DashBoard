"use client";

import { RefreshCw, FileCheck2 } from "lucide-react";

type Props = {
  totalAudits: number;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export default function RetailAuditHeader({
  totalAudits,
  loading = false,
  refreshing = false,
  onRefresh,
}: Props) {
  return (
    <div className="mb-8">
      {/* Top Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-0.03em] text-[#02011A]">
            Audit Report
          </h1>

          <p className="mt-2 text-[14px] text-[#6B7280]">
            Manage and monitor all retail store audit reports
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="
            inline-flex
            h-[48px]
            items-center
            gap-2
            rounded-[16px]
            border
            border-[#E5E7EB]
            bg-white
            px-5
            text-sm
            font-semibold
            text-[#02011A]
            shadow-sm
            transition-all
            hover:bg-[#F8FAFC]
            disabled:opacity-60
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${
              refreshing
                ? "animate-spin"
                : ""
            }`}
          />

          Refresh
        </button>
      </div>
    </div>
  );
}