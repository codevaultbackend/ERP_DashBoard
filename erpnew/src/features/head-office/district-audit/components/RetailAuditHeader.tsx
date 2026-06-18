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
              lg:text-[30px]
              leading-[32px]
              font-bold
              tracking-[-0.03em]
              text-[#101828]
            "
          >
            Audit Reports
          </h1>

          <p
            className="
              mt-2
              text-[16px]
              font-[400]
              sm:text-[15px]
              text-[#101828]
            "
          >
            Manage and monitor all retail store audit reports
          </p>
        </div>
      </div>
    </div>
  );
}