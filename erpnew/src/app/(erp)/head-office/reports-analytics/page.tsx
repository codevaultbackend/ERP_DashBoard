"use client";

import { ArrowUpRight, BarChart3, CircleDollarSign } from "lucide-react";
import MetricCard from "../../../../features/retail/reports-analytics/components/MetricCard";
import CashReconciliationChart from "../../../../features/retail/reports-analytics/components/CashReconciliationChart";
import CategorySalesChart from "../../../../features/retail/reports-analytics/components/CategorySalesChart";
import MetalTypeChart from "../../../../features/retail/reports-analytics/components/MetalTypeChart";
import TopProductsTable from "../../../../features/retail/reports-analytics/components/TopProductsTable";

export default function ReportsAnalyticsPage() {
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
        <MetricCard
          title="Total Cash Received"
          value="1"
          icon={<CircleDollarSign className="h-6 w-6 text-[#16A34A]" strokeWidth={2.2} />}
          iconWrapClassName="bg-[#DCFCE7]"
        />

        <MetricCard
          title="Account Transfer"
          value="0"
          icon={<ArrowUpRight className="h-6 w-6 text-[#3B82F6]" strokeWidth={2.2} />}
          iconWrapClassName="bg-[#DBEAFE]"
        />

        <MetricCard
          title="Total Sales"
          value="1"
          icon={<BarChart3 className="h-6 w-6 text-[#A855F7]" strokeWidth={2.2} />}
          iconWrapClassName="bg-[#F3E8FF]"
        />
      </div>

      <div className="mt-5">
        <CashReconciliationChart />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <CategorySalesChart />
        <MetalTypeChart />
      </div>

      <div className="mt-5">
        <TopProductsTable />
      </div>
    </div>
  );
}