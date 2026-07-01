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
import Link from "next/link";

type StatTone = "gold" | "green" | "red" | "purple";

type StatItem = {
  title: string;
  value: string;
  change?: string;
  trend?: "green" | "red";
  icon: LucideIcon;
  tone: StatTone;
  navigateLink?: string;
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
      navigateLink: "/head-office/stock-management"
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

  console.log("StateCards deadStock", cards?.deadStock);

  return (
    <div
      className="
    grid
    grid-cols-1
    gap-4
    max-[768px]:grid-cols-2
    md:grid-cols-3
    min-[1240px]:!grid-cols-6
  "
    >
      {stats.map((item) => {
        const Icon = item.icon;
        const tone = getToneClasses(item.tone);

        const Card = (
          <div
            key={item.title}
            className={cn(
              `
    min-h-[132px]
    h-[153px]
    mt-4 max-[768px]:mt-0 max-[768px]:h-[143px]
    rounded-erp-2xl
    border
    border-erp-border
    bg-erp-card
    px-4
    py-4
    shadow-erp-card
    sm:px-5
    sm:py-5
  `,
              item.navigateLink && "cursor-pointer hover:border-[0.5px]  hover:border-green-800"
            )}
          >
            <div
              className={cn(
                "flex h-[42px] w-[42px] items-center justify-center rounded-erp-xs sm:h-[48px] sm:w-[48px] sm:rounded-erp-sm xl:h-[50px] xl:w-[50px]",
                tone.softBg
              )}
            >
              <Icon className={cn("h-4 w-4 xl:h-4 xl:w-4", tone.icon)} />
            </div>

            <div className="mt-4 max-[768px]:!mt-6">
              <p className="text-[14px] font-[400] leading-[100%] text-erp-muted">
                {item.title}
              </p>

              <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                <h3 className="truncate text-[28px] font-semibold leading-tight text-erp-heading max-[768px]:text-[22px] xl:text-[28px]">
                  {item.value}
                </h3>

                {item.change && (
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-1 text-[12px] font-semibold leading-none sm:text-[13px]",
                      item.trend === "red"
                        ? "text-erp-danger"
                        : "text-erp-success"
                    )}
                  >
                    <span>↗</span>
                    <span>{item.change}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

        return item.navigateLink ? (
          <Link key={item.title} href={item.navigateLink}>
            {Card}
          </Link>
        ) : (
          <div key={item.title}>{Card}</div>
        );
      })}
    </div>
  );
}