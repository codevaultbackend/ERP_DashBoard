"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useReportsAnalytics } from "./hooks/useReportsAnalytics";
import ReportsMetricGrid from "./components/ReportsMetricGrid";
import CashVsAccountChart from "./components/CashVsAccountChart";
import CategoryWiseSalesChart from "./components/CategoryWiseSalesChart";
import MetalTypeDistributionChart from "./components/MetalTypeDistributionChart";
import TopProductsTable from "./components/TopProductsTable";
import ReportsSkeleton from "./components/ReportsSkeleton";

function ReportsHeader() {
  return (
    <div className="mb-5 sm:mb-6">
      <h1 className="text-[26px] font-extrabold leading-[32px] tracking-[-0.04em] text-erp-heading sm:text-[30px] sm:leading-[38px] lg:text-[34px] lg:leading-[42px]">
        Reports &amp; Analytics
      </h1>

      <p className="mt-1.5 text-[13px] font-medium leading-[20px] tracking-[-0.02em] text-erp-muted sm:text-[15px] lg:text-[18px] lg:leading-[24px]">
        Comprehensive business insights and performance metrics
      </p>
    </div>
  );
}

export default function ReportsAnalyticsContent() {
  const { data, loading, error, refetch } = useReportsAnalytics();

  if (loading) {
    return (
      <main className="min-h-screen w-full min-w-0 bg-erp-page ">
        <ReportsSkeleton />
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full min-w-0 bg-erp-page ">
      <ReportsHeader />

      {error ? (
        <section className="mb-5 flex flex-col gap-4 rounded-erp-lg border border-erp-danger/20 bg-erp-danger-soft px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-erp-danger" />

            <div>
              <h2 className="text-[15px] font-extrabold text-erp-danger">
                Failed to load reports
              </h2>

              <p className="mt-1 text-[13px] font-semibold text-erp-danger">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refetch}
            className="inline-flex h-[40px] items-center justify-center gap-2 rounded-erp-sm bg-erp-danger px-4 text-[13px] font-bold text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </section>
      ) : null}

      <div className="space-y-5 sm:space-y-6">
        <ReportsMetricGrid summary={data.dashboardSummary} />

        <CashVsAccountChart
          data={data.cashVsAccount}
          summary={data.dashboardSummary}
        />

        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          <CategoryWiseSalesChart data={data.categorySales} />
          <MetalTypeDistributionChart data={data.typeDistribution} />
        </div>

        <TopProductsTable data={data.topProducts} />
      </div>
    </main>
  );
}