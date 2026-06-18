"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useReportsAnalytics } from "./useReportsAnalytics";
import ReportMetrics from "./ReportMetrics";
import ReportsCharts from "./ReportsCharts";

function ReportsSkeleton() {
  return (
    <div className="space-y-5">
      <div>
        <div className="h-9 w-[260px] animate-pulse rounded-erp-xs bg-erp-border" />
        <div className="mt-3 h-4 w-[430px] max-w-full animate-pulse rounded-erp-xs bg-erp-border" />
      </div>

      <div className="grid grid-cols-1 gap-4 max-[768px]:grid-cols-2 xl:grid-cols-4 xl:gap-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-[132px] animate-pulse rounded-[26px] bg-erp-card shadow-erp-card"
          />
        ))}
      </div>

      <div className="h-[430px] animate-pulse rounded-erp-2xl bg-erp-card shadow-erp-card" />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="h-[410px] animate-pulse rounded-erp-2xl bg-erp-card shadow-erp-card" />
        <div className="h-[410px] animate-pulse rounded-erp-2xl bg-erp-card shadow-erp-card" />
      </div>

      <div className="h-[430px] animate-pulse rounded-erp-2xl bg-erp-card shadow-erp-card" />
    </div>
  );
}

function ReportsHeader() {
  return (
    <div className="mb-5">
      <h1 className="text-[26px] font-semibold leading-[32px] tracking-[-0.04em] text-erp-heading sm:text-[30px] sm:leading-[38px] lg:text-[34px] lg:leading-[42px]">
        Reports &amp; Analytics
      </h1>

      <p className="mt-[2px] text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-erp-muted sm:text-[16px] lg:text-[18px] lg:leading-[24px]">
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
              <h2 className="text-[15px] font-semibold text-erp-danger">
                Failed to load reports
              </h2>

              <p className="mt-1 text-[13px] font-medium text-erp-danger">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refetch}
            className="inline-flex h-[40px] items-center justify-center gap-2 rounded-erp-sm bg-erp-danger px-4 text-[13px] font-semibold text-white"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </section>
      ) : null}

      <div className="space-y-5">
        <ReportMetrics cards={data.cards} />

        <ReportsCharts
          monthlyTrend={data.monthlyTrend}
          categorySales={data.categorySales}
          metalDistribution={data.metalDistribution}
          dailyTrend={data.dailyTrend}
        />
      </div>
    </main>
  );
}