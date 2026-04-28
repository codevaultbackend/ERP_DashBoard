"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  OctagonAlert,
  Package,
  TruckIcon,
} from "lucide-react";

import ProfitLossChart from "./ProfitLossChart";
import RecentActivities from "./RecentActivities";
import StatCard from "./StatCard";
import StorePerformanceChart from "./StorePerformanceChart";
import {
  fetchDistrictDashboard,
  type DistrictDashboardData,
} from "../api";

function formatNumber(value?: number) {
  return new Intl.NumberFormat("en-IN").format(Number(value || 0));
}

function formatMoney(value?: number) {
  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0))}`;
}

export default function DistrictDashboardContent() {
  const [data, setData] = useState<DistrictDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await fetchDistrictDashboard();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load district dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const statCards = useMemo(
    () => [
      {
        title: "Total Stock",
        value: formatNumber(data?.summary_cards?.total_stock),
        icon: Package,
        iconWrap: "bg-[#FFF2C6]",
        iconColor: "text-[#C39A24]",
      },
      {
        title: "Retail Stores Stocks",
        value: formatNumber(data?.summary_cards?.retail_stores_stocks),
        icon: Package,
        iconWrap: "bg-[#FFF2C6]",
        iconColor: "text-[#C39A24]",
      },
      {
        title: "Dead Stock Items",
        value: formatNumber(data?.summary_cards?.dead_stock_items),
        icon: OctagonAlert,
        iconWrap: "bg-[#FFE8E8]",
        iconColor: "text-[#FF1F1F]",
      },
      {
        title: "Transit Goods",
        value: formatNumber(data?.summary_cards?.transit_goods),
        icon: TruckIcon,
        iconWrap: "bg-[#F3E8FF]",
        iconColor: "text-[#A855F7]",
      },
      {
        title: "Gold Price",
        value: formatMoney(data?.summary_cards?.gold_price_value),
        icon: BadgeIndianRupee,
        iconWrap: "bg-[#FFF2C6]",
        iconColor: "text-[#C39A24]",
      },
      {
        title: "Silver Price",
        value: formatMoney(data?.summary_cards?.silver_price_value),
        icon: BadgeIndianRupee,
        iconWrap: "bg-[#FFF2C6]",
        iconColor: "text-[#C39A24]",
      },
    ],
    [data]
  );

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-[#F5F6F8]">
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[150px] animate-pulse rounded-[28px] bg-white shadow-sm"
            />
          ))}
        </section>

        <div className="mt-4 h-[390px] animate-pulse rounded-[32px] bg-white shadow-sm" />

        <div className="mt-4 grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="h-[390px] animate-pulse rounded-[32px] bg-white shadow-sm" />
          <div className="h-[390px] animate-pulse rounded-[32px] bg-white shadow-sm" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen w-full bg-[#F5F6F8]">
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <p className="font-semibold">Dashboard failed to load</p>
          <p className="mt-1">{error}</p>

          <button
            onClick={loadDashboard}
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#F5F6F8]">
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </section>

      <section className="mt-4">
        <StorePerformanceChart data={data?.store_performance || []} />
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
        <ProfitLossChart data={data?.profit_loss || []} />
        <RecentActivities data={data?.recent_activities || []} />
      </section>
    </main>
  );
}