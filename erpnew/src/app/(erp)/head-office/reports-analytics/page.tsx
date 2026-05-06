"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import ReportsHeader from "../../../../features/retail/reports-analytics/components/ReportsHeader";
import ReportsMetricGrid from "../../../../features/retail/reports-analytics/components/ReportsMetricGrid";
import MonthlySalesProfitChart from "../../../../features/retail/reports-analytics/components/MonthlySalesProfitChart";
import CategoryWiseSalesChart from "../../../../features/retail/reports-analytics/components/CategoryWiseSalesChart";
import MetalTypeDistributionChart from "../../../../features/retail/reports-analytics/components/MetalTypeDistributionChart";
import DailySalesTrendChart from "../../../../features/retail/reports-analytics/components/DailySalesTrendChart";
import ReportsSkeleton from "../../../../features/retail/reports-analytics/components/ReportsSkeleton";

import { useReportsAnalytics } from "../../../../features/retail/reports-analytics/hooks/useReportsAnalytics";

export default function ReportsAnalyticsPage() {
  const {
    summary,
    monthlyTrendData,
    categorySalesData,
    typeDistributionData,
    dailyTrendData,
    loading,
    error,
    refetch,
  } = useReportsAnalytics("head", undefined, "daily");

  if (loading) {
    return (
      <main className="w-full bg-erp-page pb-10">
        <ReportsSkeleton />
      </main>
    );
  }

  if (error) {
    return (
      <main className="w-full bg-erp-page pb-10">
        <ReportsHeader />

        <section className="mt-6 flex min-h-[320px] flex-col items-center justify-center rounded-xl border bg-white text-center shadow">
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

  const isEmpty =
    !loading &&
    !error &&
    !monthlyTrendData.length &&
    !categorySalesData.length &&
    !typeDistributionData.length &&
    !dailyTrendData.length;

  return (
    <main className="w-full bg-erp-page pb-10">
      <ReportsHeader />

      {isEmpty ? (
        <section className="mt-6 flex min-h-[300px] items-center justify-center rounded-xl border bg-white">
          <p className="text-sm text-gray-500">No analytics data available</p>
        </section>
      ) : (
        <>
          <section className="mt-4">
            <ReportsMetricGrid
              summary={summary}
              typeDistributionData={typeDistributionData}
            />
          </section>

          <section className="mt-6">
            <MonthlySalesProfitChart data={monthlyTrendData} />
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <CategoryWiseSalesChart data={categorySalesData} />
            <MetalTypeDistributionChart data={typeDistributionData} />
          </section>

          <section className="mt-6">
            <DailySalesTrendChart data={dailyTrendData} />
          </section>
        </>
      )}
    </main>
  );
}