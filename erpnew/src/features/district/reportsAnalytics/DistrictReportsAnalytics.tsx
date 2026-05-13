"use client";

import { useEffect, useState } from "react";
import { getDistrictReportsAnalytics } from "./api";
import type { DistrictReportsData, ReportsPeriod } from "./types";
import CashVsAccountChart from "./component/CashVsAccountChart";
import CategorySalesChart from "./component/CategorySalesChart";
import ErrorAlert from "./component/ErrorAlert";
import LoadingState from "./component/LoadingState";
import MetalTypeDistributionChart from "./component/MetalTypeDistributionChart";
import ReportsHeader from "./component/ReportsHeader";
import ReportsStatsGrid from "./component/ReportsStatsGrid";
import TopProductsTable from "./component/TopProductsTable";

const emptyData: DistrictReportsData = {
  summary: {
    totalCustomers: 0,
    totalRevenue: 0,
    totalSales: 0,
    totalCashReceived: 0,
    accountTransfer: 0,
  },
  cashVsAccount: [],
  categorySales: [],
  typeDistribution: [],
  topProducts: [],
};

export default function DistrictReportsAnalytics() {
  const [period, setPeriod] = useState<ReportsPeriod>("daily");
  const [data, setData] = useState<DistrictReportsData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadReports(isRefresh = false) {
    try {
      setError("");

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getDistrictReportsAnalytics({ period });
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch reports data"
      );
      setData(emptyData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadReports(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  return (
    <main className="min-h-screen">
      <div>
        <ReportsHeader
          period={period}
          loading={loading}
          refreshing={refreshing}
          onPeriodChange={setPeriod}
          onRefresh={() => loadReports(true)}
        />

        <ErrorAlert message={error} />

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <ReportsStatsGrid summary={data.summary} />

            <CashVsAccountChart period={period} data={data.cashVsAccount} />

            <section className="mb-[18px] grid grid-cols-1 gap-[18px] xl:grid-cols-2">
              <CategorySalesChart data={data.categorySales} />
              <MetalTypeDistributionChart data={data.typeDistribution} />
            </section>

            <TopProductsTable data={data.topProducts} />
          </>
        )}
      </div>
    </main>
  );
}