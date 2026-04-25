"use client";

import { useDashboard } from "@/shared/hooks/useDashboard";

import StateCountCards from "../../../../features/retail/dashboard/StateCountCards";
import SalesTrendChart from "../../../../features/retail/dashboard/SalesTrendChart";
import SalesByCategoryChart from "../../../../features/retail/dashboard/SalesByCategoryChart";
import PendingTasksCard from "@/features/retail/dashboard/PendingTasksCard";
import RecentActivitiesCard from "@/features/retail/dashboard/RecentActivitiesCard";

export default function RetailDashboardPage() {
  const { data, loading } = useDashboard();

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-5">
      <StateCountCards data={data?.cards} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.02fr_1fr]">
        <SalesTrendChart data={data?.charts?.sales_trends} />
        <SalesByCategoryChart data={data?.charts?.sales_by_category} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <PendingTasksCard data={data?.pending_tasks} />
        <RecentActivitiesCard data={data?.recent_activities} />
      </div>
    </div>
  );
}