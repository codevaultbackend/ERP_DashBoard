"use client";

import {
  ArrowUpRight,
  Box,
  CircleCheck,
  MoveDownRight,
  Truck,
} from "lucide-react";

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
    changeTone: "green",
  },
  {
    key: "approvedRequests",
    title: "Approved Requests",
    tone: "green",
    icon: CircleCheck,
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
    <div className="grid grid-cols-1 gap-4 max-[768px]:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.key}
            className="
              rounded-[32px]
              border border-erp-border
              bg-erp-card
              shadow-erp-card
              p-4
              sm:p-5
              xl:p-6
              min-h-[140px]
              sm:min-h-[160px]
              transition-all
            "
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-xl",
                "h-11 w-11 sm:h-12 sm:w-12 xl:h-14 xl:w-14",
                toneClasses[item.tone]
              )}
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2]" />
            </div>

            <div className="mt-4 sm:mt-5">
              <p className="text-sm font-medium text-[#282828]">
                {item.title}
              </p>

              <div className="mt-3 flex items-end justify-between gap-2">
                <h3
                  className="
                    font-semibold
                    text-[#000]
                    leading-none
                    text-2xl
                    sm:text-3xl
                    xl:text-[38px]
                  "
                >
                  {values[item.key]}
                </h3>

                {item.change ? (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs sm:text-sm font-semibold",
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