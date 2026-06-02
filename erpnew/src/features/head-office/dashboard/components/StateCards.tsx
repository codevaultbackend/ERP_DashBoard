"use client";

import {
  Package,
  CircleDollarSign,
  BadgeAlert,
  Truck,
  Box,
  type LucideIcon,
} from "lucide-react";
import type { DashboardCards } from "../hooks/useHeadOfficeDashboard";

type StatTone = "gold" | "green" | "red" | "purple";

type StatItem = {
  title: string;
  value: string;
  change?: string;
  trend?: "green" | "red";
  icon: LucideIcon;
  tone: StatTone;
};

type Props = {
  cards?: DashboardCards;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function getToneClasses(tone: StatTone) {
  switch (tone) {
    case "gold":
      return { softBg: "bg-erp-yellow-soft", icon: "text-erp-yellow" };
    case "green":
      return { softBg: "bg-erp-success-soft", icon: "text-erp-success" };
    case "red":
      return { softBg: "bg-erp-danger-soft", icon: "text-erp-danger" };
    case "purple":
      return { softBg: "bg-erp-purple-soft", icon: "text-erp-purple" };
  }
}

export default function StateCards({ cards }: Props) {
  const stats: StatItem[] = [
    {
      title: "Total Stock",
      value: formatNumber(cards?.totalStock || 0),
      icon: Box,
      tone: "gold",
    },
    {
      title: "Total Stocks Value",
      value: formatCurrencyCompact(cards?.stockValue || 0),
      icon: CircleDollarSign,
      tone: "green",
    },
    {
      title: "Dead Stock Items",
      value: formatNumber(cards?.deadStock?.count || 0),
      change: cards?.deadStock?.percentage || "0%",
      trend: "red",
      icon: BadgeAlert,
      tone: "red",
    },
    {
      title: "Transit Goods",
      value: formatNumber(cards?.transitStock || 0),
      icon: Truck,
      tone: "purple",
    },

    // ✅ FIXED GOLD PRICE
    {
      title: "Gold Price",
      value: formatCurrencyCompact(cards?.goldPrice || 0),
      icon: Package,
      tone: "gold",
    },
    {
      title: "Silver Price",
      value: formatCurrencyCompact(cards?.silverPrice || 0),
      icon: Package,
      tone: "gold",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 max-[768px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      {stats.map((item) => {
        const Icon = item.icon;
        const tone = getToneClasses(item.tone);

        return (
          <div
            key={item.title}
            className="min-h-[132px] rounded-erp-md border border-erp-border bg-erp-card px-4 py-4 shadow-erp-card sm:min-h-[140px] sm:rounded-erp-lg sm:px-5 sm:py-5 xl:min-h-[150px] xl:rounded-erp-xl"
          >
            <div
              className={cn(
                "flex h-[42px] w-[42px] items-center justify-center rounded-erp-xs sm:h-[48px] sm:w-[48px] sm:rounded-erp-sm xl:h-[52px] xl:w-[52px]",
                tone.softBg
              )}
            >
              <Icon className={cn("h-5 w-5 xl:h-[23px] xl:w-[23px]", tone.icon)} />
            </div>

            <div className="mt-4 sm:mt-5">
              <p className="text-[13px] font-medium leading-[1.25] text-erp-muted sm:text-[14px] xl:text-[15px]">
                {item.title}
              </p>

              <div className="mt-2 flex items-end justify-between gap-2">
                <h3 className="break-words text-[22px] font-semibold leading-none tracking-[-0.04em] text-erp-heading sm:text-[24px] xl:text-[25px]">
                  {item.value}
                </h3>

                {item.change ? (
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-1 text-[12px] font-semibold leading-none sm:text-[13px]",
                      item.trend === "red" ? "text-erp-danger" : "text-erp-success"
                    )}
                  >
                    <span>↗</span>
                    <span>{item.change}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}