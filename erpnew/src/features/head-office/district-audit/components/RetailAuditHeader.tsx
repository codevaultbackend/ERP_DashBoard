"use client";

import {
  RefreshCw,
  FileCheck2,
} from "lucide-react";

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
    <div className="mb-4 sm:mb-4">
      {/* Header */}

      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* Left Side */}

        <div>
          <h1
            className="
              text-[24px]
              sm:text-[28px]
              lg:text-[32px]
              font-bold
              tracking-[-0.03em]
              text-[#02011A]
            "
          >
            Audit Reports
          </h1>

          <p
            className="
              mt-2
              text-sm
              sm:text-[15px]
              text-[#6B7280]
            "
          >
            Manage and monitor all retail store audit reports
          </p>
        </div>

        {/* Right Side */}

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="
            inline-flex
            w-full
            sm:w-auto
            items-center
            justify-center
            gap-2
            rounded-xl
            sm:rounded-2xl
            border
            border-[#E5E7EB]
            bg-white
            px-5
            py-3
            text-sm
            font-semibold
            text-[#02011A]
            shadow-sm
            transition-all
            hover:bg-[#F8FAFC]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <RefreshCw
            className={`
              h-4
              w-4
              ${
                refreshing
                  ? "animate-spin"
                  : ""
              }
            `}
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* Stats Card */}

      <div
        className="
          mt-5
          rounded-2xl
          border
          border-[#E5E7EB]
          bg-white
          p-4
          sm:p-5
          shadow-sm
        "
      >
        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#EEF4FF]
            "
          >
            <FileCheck2
              className="
                h-6
                w-6
                text-[#2563EB]
              "
            />
          </div>

          <div>
            <p
              className="
                text-xs
                font-medium
                uppercase
                tracking-wide
                text-[#94A3B8]
              "
            >
              Total Reports
            </p>

            <h3
              className="
                text-2xl
                font-bold
                text-[#02011A]
              "
            >
              {loading
                ? "--"
                : totalAudits}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}