import StateCards from "@/features/head-office/dashboard/components/StateCards";
import SalesPurchaseTrendsChart from "@/features/head-office/dashboard/components/SalesPurchaseTrendsChart";
import MonthlyRevenueTrendChart from "@/features/head-office/dashboard/components/MonthlyRevenueTrendChart";
import ProfitLossChart from "@/features/head-office/dashboard/components/ProfitLossChart";
import RecentActivitiesCard from "@/features/head-office/dashboard/components/RecentActivitiesCard";

export default function RetailDashboardPage() {
  return (
    <div className="space-y-4 md:space-y-5">
      <StateCards />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.02fr_1fr]">
        <SalesPurchaseTrendsChart />
        <MonthlyRevenueTrendChart />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <ProfitLossChart />
        <RecentActivitiesCard />
      </div>
    </div>
  );
}