"use client";

import {
  Package,
  CircleDollarSign,
  BadgeAlert,
  Truck,
  Box,
  type LucideIcon,
} from "lucide-react";

type StatTone = "gold" | "green" | "red" | "purple";
type TrendTone = "green" | "red";

type StatItem = {
  title: string;
  value: string;
  change?: string;
  trend?: TrendTone;
  icon: LucideIcon;
  tone: StatTone;
};

const stats: StatItem[] = [
  {
    title: "Total Stock",
    value: "2,543",
    change: "+12.5%",
    trend: "green",
    icon: Box,
    tone: "gold",
  },
  {
    title: "Total Stocks Value",
    value: "4.5M",
    icon: CircleDollarSign,
    tone: "green",
  },
  {
    title: "Dead Stock Items",
    value: "20",
    change: "+12.5%",
    trend: "red",
    icon: BadgeAlert,
    tone: "red",
  },
  {
    title: "Transit Goods",
    value: "45",
    icon: Truck,
    tone: "purple",
  },
  {
    title: "Gold Price",
    value: "$20M",
    change: "+12.5%",
    trend: "green",
    icon: Package,
    tone: "gold",
  },
  {
    title: "Silver Price",
    value: "$12M",
    change: "+12.5%",
    trend: "green",
    icon: Package,
    tone: "gold",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getToneClasses(tone: StatTone) {
  switch (tone) {
    case "gold":
      return {
        softBg: "bg-[#FFF3CC]",
        icon: "text-[#B8860B]",
      };
    case "green":
      return {
        softBg: "bg-[#CFF7D6]",
        icon: "text-[#16A34A]",
      };
    case "red":
      return {
        softBg: "bg-[#FDE2E2]",
        icon: "text-[#EF4444]",
      };
    case "purple":
      return {
        softBg: "bg-[#E9D5FF]",
        icon: "text-[#9333EA]",
      };
    default:
      return {
        softBg: "bg-[#F3F4F6]",
        icon: "text-[#111827]",
      };
  }
}

export default function StateCards() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 ">
      {stats.map((item) => {
        const Icon = item.icon;
        const tone = getToneClasses(item.tone);

        return (
          <div
            key={item.title}
            className={cn(
              "min-h-[132px] rounded-[20px] border border-[#DADDE3] bg-[#FCFCFD]",
              "px-4 py-4 shadow-[0px_10px_30px_rgba(17,24,39,0.04),0px_2px_8px_rgba(17,24,39,0.03)]",
              "sm:min-h-[140px] sm:rounded-[24px] sm:px-5 sm:py-5",
              "xl:min-h-[150px] xl:rounded-[28px]"
            )}
          >
            <div
              className={cn(
                "flex h-[42px] w-[42px] items-center justify-center rounded-[14px] sm:h-[48px] sm:w-[48px] sm:rounded-[16px] xl:h-[52px] xl:w-[52px] xl:rounded-[18px]",
                tone.softBg
              )}
            >
              <Icon className={cn("h-[18px] w-[18px] sm:h-[20px] sm:w-[20px] xl:h-[23px] xl:w-[23px] stroke-[1.9]", tone.icon)} />
            </div>

            <div className="mt-4 sm:mt-5">
              <p className="text-[13px] font-medium leading-[1.25] text-[#5E6470] sm:text-[14px] xl:text-[15px]">
                {item.title}
              </p>

              <div className="mt-2 flex items-end justify-between gap-2 sm:gap-3">
                <h3 className="text-[24px] font-semibold leading-none tracking-[-0.04em] text-[#0F172A] sm:text-[26px] xl:text-[27px]">
                  {item.value}
                </h3>

                {item.change ? (
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-1 text-[12px] font-semibold leading-none sm:text-[13px] xl:text-[14px]",
                      item.trend === "red" ? "text-[#FF3B30]" : "text-[#22C55E]"
                    )}
                  >
                    <span className="text-[13px] sm:text-[14px] xl:text-[15px]">↗</span>
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