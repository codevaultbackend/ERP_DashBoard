"use client";

import {
  ArrowUpRight,
  BadgeAlert,
  Box,
  MoveDownRight,
  Truck,
} from "lucide-react";
import { stockStats } from "../../data/stock-management-data";

type StockStatItem = {
  id: string;
  title: string;
  value: string | number;
  tone: string;
  icon: string;
  change?: string;
  changeTone?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getToneClasses(tone: string) {
  switch (tone) {
    case "gold":
      return {
        iconWrap: "bg-erp-yellow-soft",
        iconColor: "text-erp-yellow",
      };

    case "red":
      return {
        iconWrap: "bg-erp-danger-soft",
        iconColor: "text-erp-danger",
      };

    case "soft-red":
      return {
        iconWrap: "bg-erp-warning-soft",
        iconColor: "text-erp-warning",
      };

    case "purple":
      return {
        iconWrap: "bg-erp-purple-soft",
        iconColor: "text-erp-purple",
      };

    default:
      return {
        iconWrap: "bg-[#F3F4F6]",
        iconColor: "text-[#111827]",
      };
  }
}

function getIcon(icon: string, className: string) {
  switch (icon) {
    case "badge":
      return <BadgeAlert className={className} />;

    case "arrow":
      return <MoveDownRight className={className} />;

    case "truck":
      return <Truck className={className} />;

    default:
      return <Box className={className} />;
  }
}

type Props = {
  stats?: StockStatItem[];
};

export default function StockStatCards({ stats = stockStats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {stats.map((item) => {
        const tone = getToneClasses(item.tone);

        return (
          <div
            key={item.id}
            className={cn(
              "flex min-h-[164px] flex-col justify-between",
              "rounded-[32px] border border-erp-border bg-erp-card",
              "px-[18px] py-[16px] shadow-erp-card"
            )}
          >
            <div
              className={cn(
                "flex h-[54px] w-[54px] items-center justify-center rounded-[18px]",
                tone.iconWrap
              )}
            >
              {getIcon(
                item.icon,
                cn("h-[23px] w-[23px] stroke-[1.85]", tone.iconColor)
              )}
            </div>

            <div>
              <p className="text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-[#282828]">
                {item.title}
              </p>

              <div className="mt-[6px] flex items-end justify-between gap-3">
                <h3 className="text-[34px] font-semibold leading-[38px] tracking-[-0.06em] text-black">
                  {item.value}
                </h3>

                {item.change ? (
                  <div
                    className={cn(
                      "mb-[6px] flex shrink-0 items-center gap-[4px]",
                      "text-[15px] font-semibold leading-none tracking-[-0.02em]",
                      item.changeTone === "red"
                        ? "text-erp-danger"
                        : "text-erp-success"
                    )}
                  >
                    <ArrowUpRight className="h-[16px] w-[16px] stroke-[2.2]" />
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