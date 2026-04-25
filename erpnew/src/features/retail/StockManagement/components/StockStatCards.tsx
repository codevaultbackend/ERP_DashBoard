"use client";

import { ArrowUpRight, BadgeAlert, Box, MoveDownRight, Truck } from "lucide-react";
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
        iconWrap: "bg-[#FDF1C9]",
        iconColor: "text-[#C8A63A]",
      };
    case "red":
      return {
        iconWrap: "bg-[#FBE9E9]",
        iconColor: "text-[#FF3B30]",
      };
    case "soft-red":
      return {
        iconWrap: "bg-[#F8E7E7]",
        iconColor: "text-[#FF3B30]",
      };
    case "purple":
      return {
        iconWrap: "bg-[#EEDBFF]",
        iconColor: "text-[#9333EA]",
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
    <div className="grid grid-cols-4 max-[768px]:grid-cols-2 gap-4 max-[1000px]:grid-cols-3  2xl:grid-cols-4">
      {stats.map((item) => {
        const tone = getToneClasses(item.tone);

        return (
          <div
            key={item.id}
            className={cn(
              "rounded-[32px] border border-[#E3E7ED] bg-[#FCFCFD]",
              "px-4 py-4 shadow-[1px_1px_4px_0_#0000001A]",
              "sm:px-5 sm:py-5 xl:min-h-[164px] max-w-[272px]"
            )}
          >
            <div
              className={cn(
                "flex h-[50px] w-[50px] items-center justify-center rounded-[18px]",
                tone.iconWrap
              )}
            >
              {getIcon(item.icon, cn("h-[22px] w-[22px] stroke-[1.8]", tone.iconColor))}
            </div>

            <div className="mt-5">
              <p className="text-[14px] font-[400] leading-[1.25] text-[#282828]">
                {item.title}
              </p>

              <div className="mt-3 flex items-end justify-between gap-3">
                <h3 className="text-[28px] font-[590] leading-none tracking-[-0.04em] text-[#000000] sm:text-[26px] md:text-[28px]">
                  {item.value}
                </h3>

                {item.change ? (
                  <div
                    className={cn(
                      "flex shrink-0 items-center gap-1 text-[13px] font-semibold sm:text-[14px]",
                      item.changeTone === "red" ? "text-[#FF3B30]" : "text-[#22C55E]"
                    )}
                  >
                    <ArrowUpRight className="h-[16px] w-[16px]" />
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