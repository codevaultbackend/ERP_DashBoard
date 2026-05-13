import {
  BadgeIndianRupee,
  BarChart3,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";
import type { DistrictReportsData } from "../types";
import { formatCompactCurrency } from "../utils";
import StatCard from "./StatCard";

type ReportsStatsGridProps = {
  summary: DistrictReportsData["summary"];
};

export default function ReportsStatsGrid({ summary }: ReportsStatsGridProps) {
  return (
    <section className="mb-[28px] grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-3">
     

      <StatCard
        label="Total Sales"
        value={summary.totalSales}
        icon={BarChart3}
        iconWrap="bg-[#F4E8FF]"
        iconClass="text-[#A855F7]"
      />

      <StatCard
        label="Cash Received"
        value={formatCompactCurrency(summary.totalCashReceived)}
        icon={DollarSign}
        iconWrap="bg-[#EAFBF0]"
        iconClass="text-[#039855]"
      />

      <StatCard
        label="Account Transfer"
        value={formatCompactCurrency(summary.accountTransfer)}
        icon={CreditCard}
        iconWrap="bg-[#EAF6FF]"
        iconClass="text-[#2F80ED]"
      />
    </section>
  );
}