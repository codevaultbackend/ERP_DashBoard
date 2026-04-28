"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { useDashboard } from "../../../../shared/hooks/useDashboard";
import StateCountCards from "@/features/retail/dashboard/StateCountCards";
import SalesTrendChart from "@/features/retail/dashboard/SalesTrendChart";
import SalesByCategoryChart from "@/features/retail/dashboard/SalesByCategoryChart";
import PendingTasksCard from "@/features/retail/dashboard/PendingTasksCard";
import RecentActivitiesCard from "@/features/retail/dashboard/RecentActivitiesCard";

export default function DashboardPage() {
  const { data, loading, error, refetch } = useDashboard();

  if (error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F4F7FB] p-4">
        <div className="w-full max-w-md rounded-[28px] border border-red-100 bg-white p-6 text-center shadow-[1px_1px_4px_0px_#0000001A]">
          <AlertCircle className="mx-auto mb-3 h-9 w-9 text-red-500" />
          <h2 className="text-[18px] font-semibold text-[#111827]">
            Unable to load dashboard
          </h2>
          <p className="mt-2 text-sm text-[#94A3B8]">{error}</p>

          <button
            onClick={refetch}
            className="mx-auto mt-5 flex h-11 items-center gap-2 rounded-[14px] bg-[#2563EB] px-5 text-sm font-semibold text-white hover:bg-[#1D4ED8]"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-[#F4F7FB] ">
      <div className="mx-auto w-full max-w-[1440px] space-y-[16px]">
        <StateCountCards data={data.cards} loading={loading} />

        <section className="grid grid-cols-1 gap-[16px] xl:grid-cols-2">
          <SalesTrendChart data={data.charts.sales_trends} loading={loading} />
          <SalesByCategoryChart
            data={data.charts.sales_by_category}
            loading={loading}
          />
        </section>

        <section className="grid grid-cols-1 gap-[16px] xl:grid-cols-[1.65fr_1fr]">
          <PendingTasksCard data={data.pending_tasks} loading={loading} />
          <RecentActivitiesCard
            data={data.recent_activities}
            loading={loading}
          />
        </section>
      </div>
    </main>
  );
}