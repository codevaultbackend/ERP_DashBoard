import { ChevronDown, RefreshCw } from "lucide-react";
import type { ReportsPeriod } from "../types";
import { cn } from "../utils";

type ReportsHeaderProps = {
  period: ReportsPeriod;
  loading?: boolean;
  refreshing?: boolean;
  onPeriodChange: (period: ReportsPeriod) => void;
  onRefresh: () => void;
};

export default function ReportsHeader({
  period,
  loading = false,
  refreshing = false,
  onPeriodChange,
  onRefresh,
}: ReportsHeaderProps) {
  return (
    <div className="mb-[26px] flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.04em] text-[#111827]">
          Reports & Analytics
        </h1>

        <p className="mt-[2px] text-[15px] font-normal leading-[22px] text-[#667085]">
          Comprehensive business insights and performance metrics
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing || loading}
          className="inline-flex h-[42px] items-center gap-2 rounded-[12px] border border-[#E4E7EC] bg-white px-4 text-[14px] font-semibold text-[#344054] shadow-sm transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Refresh
        </button>

        <div className="relative">
          <select
            value={period}
            onChange={(event) =>
              onPeriodChange(event.target.value as ReportsPeriod)
            }
            className="h-[42px] appearance-none rounded-[12px] border border-[#E4E7EC] bg-white pl-4 pr-10 text-[14px] font-semibold text-[#344054] shadow-sm outline-none transition focus:border-[#2563EB]"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
        </div>
      </div>
    </div>
  );
}