"use client";

import StateCards from "@/features/head-office/dashboard/components/StateCards";
import SalesPurchaseTrendsChart from "@/features/head-office/dashboard/components/SalesPurchaseTrendsChart";
import MonthlyRevenueTrendChart from "@/features/head-office/dashboard/components/MonthlyRevenueTrendChart";
import ProfitLossChart from "@/features/head-office/dashboard/components/ProfitLossChart";
import RecentActivitiesCard from "@/features/head-office/dashboard/components/RecentActivitiesCard";
import { useHeadOfficeDashboard } from "../../../../features/head-office/dashboard/hooks/useHeadOfficeDashboard";

export default function RetailDashboardPage() {
  const {
    cards,
    salesPurchaseTrend,
    revenueTrend,
    profitLoss,
    recentActivities,
    loading,
    error,
    refetch,
  } = useHeadOfficeDashboard();

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-5">
        <div className="grid grid-cols-2 gap-4  max-[768px]:grid-cols-2 lg:grid-cols-6 2xl:grid-cols-6 max-[768px]:gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-h-[132px] animate-pulse rounded-[20px] border border-[#DADDE3] bg-[#FCFCFD] sm:min-h-[140px] sm:rounded-[24px] xl:min-h-[150px] xl:rounded-[28px]"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.02fr_1fr]">
          <div className="h-[410px] animate-pulse rounded-[32px] border border-[#E7E9EE] bg-[#FCFCFD]" />
          <div className="h-[410px] animate-pulse rounded-[32px] border border-[#E7E9EE] bg-[#FCFCFD]" />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="h-[420px] animate-pulse rounded-[32px] border border-[#E7E9EE] bg-[#FCFCFD]" />
          <div className="h-[420px] animate-pulse rounded-[32px] border border-[#E7E9EE] bg-[#FCFCFD]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-[#FECACA] bg-[#FEF2F2] p-5">
        <p className="text-[16px] font-semibold text-[#991B1B]">
          Failed to load dashboard
        </p>
        <p className="mt-1 text-[14px] text-[#B91C1C]">{error}</p>

        <button
          type="button"
          onClick={refetch}
          className="mt-4 h-[38px] rounded-[12px] bg-[#111827] px-4 text-[14px] font-medium text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 ">
      <StateCards cards={cards} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.02fr_1fr]">
        <SalesPurchaseTrendsChart data={salesPurchaseTrend} />
        <MonthlyRevenueTrendChart data={revenueTrend} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <ProfitLossChart data={profitLoss} />
        <RecentActivitiesCard activities={recentActivities} />
      </div>
    </div>
  );
}