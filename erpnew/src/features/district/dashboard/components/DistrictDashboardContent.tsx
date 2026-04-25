"use client";

import ProfitLossChart from "./ProfitLossChart";
import RecentActivities from "./RecentActivities";
import StatCard from "./StatCard";
import StorePerformanceChart from "./StorePerformanceChart";
import { statCards } from "../../data/district-dashboard-data";

export default function DistrictDashboardContent() {
  return (
    <main className="min-h-screen w-full bg-[#F3F4F6] ">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {statCards.map((card) => (
          <StatCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconWrap={card.iconWrap}
            iconColor={card.iconColor}
          />
        ))}
      </section>

      <section className="mt-4">
        <StorePerformanceChart />
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-1 2xl:grid-cols-[minmax(0,1.8fr)_420px]">
        <ProfitLossChart />
        <RecentActivities />
      </section>
    </main>
  );
}