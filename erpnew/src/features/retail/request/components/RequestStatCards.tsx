"use client";

import { ArrowUpRight, Box, CircleCheck, MoveDownRight, Truck } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Props = {
  totalRequests: number;
  approvedRequests: number;
  lowStock: number;
  transitGoods: number;
};

const stats = [
  {
    key: "totalRequests",
    title: "Total Requests",
    tone: "gold",
    icon: Box,
    change: "+12.5%",
    changeTone: "green",
  },
  {
    key: "approvedRequests",
    title: "Approved Requests",
    tone: "green",
    icon: CircleCheck,
    change: "+12.5%",
    changeTone: "red",
  },
  {
    key: "lowStock",
    title: "Low Stock",
    tone: "red",
    icon: MoveDownRight,
  },
  {
    key: "transitGoods",
    title: "Transit Goods",
    tone: "purple",
    icon: Truck,
  },
] as const;

const toneClasses = {
  gold: "bg-erp-yellow-soft text-erp-yellow",
  green: "bg-erp-success-soft text-erp-success",
  red: "bg-erp-red-soft text-erp-danger",
  purple: "bg-erp-purple-soft text-erp-purple",
};

export default function RequestStatCards({
  totalRequests,
  approvedRequests,
  lowStock,
  transitGoods,
}: Props) {
  const values = {
    totalRequests,
    approvedRequests,
    lowStock,
    transitGoods,
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.key}
            className="min-h-[132px] rounded-erp-xl border border-erp-border bg-erp-card px-4 py-4 shadow-erp-card sm:min-h-[148px] sm:px-5 sm:py-5 xl:min-h-[166px]"
          >
            <div
              className={cn(
                "flex h-[54px] w-[54px] items-center justify-center rounded-erp-md",
                toneClasses[item.tone]
              )}
            >
              <Icon className="h-[23px] w-[23px] stroke-[1.9]" />
            </div>

            <div className="mt-5 sm:mt-6">
              <p className="text-[15px] font-normal leading-[22px] tracking-[-0.02em] text-[#282828] sm:text-[16px]">
                {item.title}
              </p>

              <div className="mt-2 flex items-end justify-between gap-3">
                <h3 className="text-[31px] font-semibold leading-[36px] tracking-[-0.04em] text-black sm:text-[34px] sm:leading-[40px]">
                  {values[item.key]}
                </h3>

                {item.change ? (
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-1 text-[14px] font-semibold leading-[20px] tracking-[-0.02em]",
                      item.changeTone === "red"
                        ? "text-erp-danger"
                        : "text-erp-success"
                    )}
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    <span>{item.change}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}