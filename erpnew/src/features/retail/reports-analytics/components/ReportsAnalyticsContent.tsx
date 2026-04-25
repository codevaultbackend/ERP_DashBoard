"use client";

import React from "react";
import CashReconciliationChart from "./CashReconciliationChart";
import CategorySalesChart from "./CategorySalesChart";
import MetalTypeChart from "./MetalTypeChart";
import TopProductsTable from "./TopProductsTable";
import ReportsMetricCards from "./ReportsMetricCards";
import { useReportsAnalytics } from "../hooks/useReportsAnalytics";

export default function ReportsAnalyticsContent() {
  const {
    summary,
    cashVsAccountData,
    categorySalesData,
    typeDistributionData,
    topProductsData,
    loading,
    error,
    refetch,
  } = useReportsAnalytics("daily");

  if (loading) {
    return (
      <div className="w-full pb-8">
        <div className="mb-6">
          <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[28px]">
            Reports &amp; Analytics
          </h1>
          <p className="mt-2 text-[15px] text-[#6B7280]">
            Comprehensive business insights and performance metrics
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[112px] animate-pulse rounded-[22px] border border-[#E5E7EB] bg-white"
            />
          ))}
        </div>

        <div className="mt-5 h-[470px] animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white" />
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="h-[365px] animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white" />
          <div className="h-[365px] animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white" />
        </div>
        <div className="mt-5 h-[420px] animate-pulse rounded-[24px] border border-[#E5E7EB] bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pb-8">
        <div className="mb-6">
          <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[28px]">
            Reports &amp; Analytics
          </h1>
          <p className="mt-2 text-[15px] text-[#6B7280]">
            Comprehensive business insights and performance metrics
          </p>
        </div>

        <div className="rounded-[22px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-4 text-[#991B1B] shadow-[0px_4px_18px_rgba(15,23,42,0.03)]">
          <p className="text-[15px] font-semibold">Failed to load reports</p>
          <p className="mt-1 text-[13px]">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 inline-flex h-[38px] items-center justify-center rounded-[12px] bg-[#111827] px-4 text-[13px] font-medium text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-8">
      <div className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[28px]">
          Reports &amp; Analytics
        </h1>
        <p className="mt-2 text-[15px] text-[#6B7280]">
          Comprehensive business insights and performance metrics
        </p>
      </div>

      <ReportsMetricCards summary={summary} />

      <div className="mt-5">
        <CashReconciliationChart data={cashVsAccountData} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <CategorySalesChart data={categorySalesData} />
        <MetalTypeChart data={typeDistributionData} />
      </div>

      <div className="mt-5">
        <TopProductsTable products={topProductsData} />
      </div>
    </div>
  );
}