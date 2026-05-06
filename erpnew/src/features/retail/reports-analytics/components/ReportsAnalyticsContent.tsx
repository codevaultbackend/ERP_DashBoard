"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import ReportsHeader from "./ReportsHeader";
import ReportsMetricGrid from "./ReportsMetricGrid";
import CashReconciliationChart from "./CashReconciliationChart";
import CategoryWiseSalesChart from "./CategoryWiseSalesChart";
import MetalTypeDistributionChart from "./MetalTypeDistributionChart";
import TopProductsTable from "./TopProductsTable";
import ReportsSkeleton from "./ReportsSkeleton";
import MonthlySalesProfitChart from "./MonthlySalesProfitChart";
import DailySalesTrendChart from "./DailySalesTrendChart";

import { useReportsAnalytics } from "../hooks/useReportsAnalytics";

type ReportsContentType = "head" | "district" | "retail";

type Props = {
  type: ReportsContentType;
  id?: number | string;
  range?: "daily" | "monthly" | "yearly";
};

export default function ReportsAnalyticsContent({
  type,
  id,
  range = "daily",
}: Props) {
  const {
    summary,
    cashVsAccountData,
    categorySalesData,
    typeDistributionData,
    topProductsData,
    monthlyTrendData,
    dailyTrendData,
    inventoryAuditData,
    meta,
    loading,
    error,
    refetch,
  } = useReportsAnalytics(type, id, range);

  if (loading) {
    return (
      <main className="w-full min-w-0 bg-erp-page pb-10">
        <ReportsSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full min-w-0 bg-erp-page pb-10">
        <ReportsHeader />

        <section className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-xl border bg-white px-4 text-center shadow">
          <AlertCircle className="h-10 w-10 text-red-500" />

          <h2 className="mt-3 text-lg font-semibold">
            Failed to load reports
          </h2>

          <p className="text-sm text-gray-500">{error}</p>

          <button
            type="button"
            onClick={refetch}
            className="mt-4 flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </section>
      </main>
    );
  }

  const hasHeadStyleData =
    monthlyTrendData.length > 0 ||
    categorySalesData.length > 0 ||
    typeDistributionData.length > 0 ||
    dailyTrendData.length > 0 ||
    inventoryAuditData.length > 0;

  const isEmpty = !hasHeadStyleData && !cashVsAccountData.length;

  return (
    <main className="w-full min-w-0 bg-erp-page pb-10">
      <ReportsHeader />

      {type === "district" && meta?.stores_count ? (
        <section className="mt-3 rounded-[18px] border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          District report showing data from{" "}
          <b>{meta.stores_count}</b> mapped retail stores.
        </section>
      ) : null}

      {type === "head" ? (
        <section className="mt-3 rounded-[18px] border border-purple-100 bg-purple-50 px-4 py-3 text-sm text-purple-700">
          Head Office report showing consolidated business analytics.
        </section>
      ) : null}

      {isEmpty ? (
        <section className="mt-6 flex min-h-[300px] items-center justify-center rounded-xl border bg-white px-4">
          <p className="text-sm text-gray-500">No analytics data available</p>
        </section>
      ) : (
        <>
          <section className="mt-4 min-w-0">
            <ReportsMetricGrid
              summary={summary}
              typeDistributionData={typeDistributionData}
            />
          </section>

          {type === "district" ? (
            <>
              <section className="mt-6 min-w-0">
                <MonthlySalesProfitChart data={monthlyTrendData} />
              </section>

              <section className="mt-6 grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="min-w-0">
                  <CategoryWiseSalesChart data={categorySalesData} />
                </div>

                <div className="min-w-0">
                  <MetalTypeDistributionChart data={typeDistributionData} />
                </div>
              </section>

              <section className="mt-6 min-w-0">
                <DailySalesTrendChart data={dailyTrendData} />
              </section>
            </>
          ) : (
            <>
              <section className="mt-6 min-w-0">
                <CashReconciliationChart data={cashVsAccountData} />
              </section>

              <section className="mt-6 grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="min-w-0">
                  <CategoryWiseSalesChart data={categorySalesData} />
                </div>

                <div className="min-w-0">
                  <MetalTypeDistributionChart data={typeDistributionData} />
                </div>
              </section>

              <section className="mt-6 min-w-0">
                <TopProductsTable data={topProductsData} />
              </section>
            </>
          )}
        </>
      )}  
    </main>
  );
}