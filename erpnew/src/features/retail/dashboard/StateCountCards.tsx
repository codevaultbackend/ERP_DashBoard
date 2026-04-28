"use client";

import {
  BadgeAlert,
  Box,
  IndianRupee,
  TrendingUp,
  Truck,
} from "lucide-react";
import type { DashboardData } from "@/hooks/useDashboard";

type Props = {
  data: DashboardData["cards"];
  loading?: boolean;
};

const cards = [
  {
    key: "total_stock",
    title: "Total Stock",
    icon: Box,
    bg: "bg-[#FFF2C6]",
    color: "text-[#C39A24]",
  },
  {
    key: "dead_stock_items",
    title: "Dead Stock Items",
    icon: BadgeAlert,
    bg: "bg-[#FFE8E8]",
    color: "text-[#FF1F1F]",
    danger: true,
  },
  {
    key: "transit_goods",
    title: "Transit Goods",
    icon: Truck,
    bg: "bg-[#F3E8FF]",
    color: "text-[#A855F7]",
  },
  {
    key: "gold_price",
    title: "Gold Price",
    icon: IndianRupee,
    bg: "bg-[#FFF2C6]",
    color: "text-[#C39A24]",
    money: true,
  },
  {
    key: "silver_price",
    title: "Silver Price",
    icon: IndianRupee,
    bg: "bg-[#FFF2C6]",
    color: "text-[#C39A24]",
    money: true,
  },
] as const;

function formatValue(value: number, money?: boolean) {
  const formatted = Number(value || 0).toLocaleString("en-IN");

  if (money) return `₹${formatted}`;
  return formatted;
}

export default function StateCountCards({ data, loading = false }: Props) {
  return (
    <section
      className="
        grid
        grid-cols-2
        gap-[12px]
        sm:gap-[14px]
        md:grid-cols-3
        lg:gap-[16px]
        xl:grid-cols-5
      "
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const value = Number(data?.[card.key] || 0);

        return (
          <article
            key={card.key}
            className="
              min-h-[132px]
              rounded-[24px]
              border border-[#E5E7EB]
              bg-white
              px-[14px]
              py-[14px]
              shadow-[1px_1px_4px_0px_#0000001A]
              sm:min-h-[145px]
              sm:rounded-[28px]
              sm:px-[16px]
              sm:py-[16px]
              xl:min-h-[154px]
              xl:rounded-[32px]
              xl:px-[17px]
              xl:py-[16px]
            "
          >
            {loading ? (
              <div className="h-full animate-pulse">
                <div className="h-[44px] w-[44px] rounded-[14px] bg-[#F1F5F9] sm:h-[50px] sm:w-[50px]" />
                <div className="mt-5 h-4 w-[75%] rounded bg-[#F1F5F9]" />
                <div className="mt-3 h-7 w-[60%] rounded bg-[#F1F5F9]" />
              </div>
            ) : (
              <>
                <div
                  className={`
                    flex
                    h-[44px]
                    w-[44px]
                    items-center
                    justify-center
                    rounded-[14px]
                    sm:h-[50px]
                    sm:w-[50px]
                    sm:rounded-[16px]
                    ${card.bg}
                  `}
                >
                  <Icon
                    className={`h-[20px] w-[20px] stroke-[1.9] sm:h-[22px] sm:w-[22px] ${card.color}`}
                  />
                </div>

                <div className="mt-[18px] sm:mt-[20px]">
                  <p
                    className="
                      truncate
                      text-[13px]
                      leading-none
                      text-[#282828]
                      sm:text-[14px]
                      xl:text-[15px]
                    "
                    title={card.title}
                  >
                    {card.title}
                  </p>

                  <div
                    className="
                      mt-[8px]
                      flex
                      items-end
                      justify-between
                      gap-[8px]
                    "
                  >
                    <h2
                      className="
                        min-w-0
                        truncate
                        text-[22px]
                        font-semibold
                        leading-none
                        tracking-[-0.04em]
                        text-black
                        sm:text-[25px]
                        xl:text-[28px]
                      "
                      title={formatValue(value, card.money)}
                    >
                      {formatValue(value, card.money)}
                    </h2>

                    <div
                      className={`
                        mb-[2px]
                        hidden
                        shrink-0
                        items-center
                        gap-[4px]
                        text-[13px]
                        font-semibold
                        leading-none
                        sm:flex
                        xl:text-[15px]
                        ${card.danger ? "text-[#FF1F1F]" : "text-[#20C94F]"}
                      `}
                    >
                      <TrendingUp className="h-[14px] w-[14px] xl:h-[16px] xl:w-[16px]" />
                      <span>+12.5%</span>
                    </div>
                  </div>

                  <div
                    className={`
                      mt-[8px]
                      flex
                      items-center
                      gap-[4px]
                      text-[12px]
                      font-semibold
                      leading-none
                      sm:hidden
                      ${card.danger ? "text-[#FF1F1F]" : "text-[#20C94F]"}
                    `}
                  >
                    <TrendingUp className="h-[13px] w-[13px]" />
                    <span>+12.5%</span>
                  </div>
                </div>
              </>
            )}
          </article>
        );
      })}
    </section>
  );
}