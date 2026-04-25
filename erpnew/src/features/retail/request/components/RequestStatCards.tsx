"use client";

import { ArrowUpRight, Box, CircleCheck, MoveDownRight, Truck } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getToneClasses(tone: string) {
  switch (tone) {
    case "gold":
      return {
        iconWrap: "bg-[#F9E9B8]",
        iconColor: "text-[#B9972B]",
      };
    case "green":
      return {
        iconWrap: "bg-[#CFF4C9]",
        iconColor: "text-[#19A447]",
      };
    case "red":
      return {
        iconWrap: "bg-[#FBE8E8]",
        iconColor: "text-[#FF3B30]",
      };
    case "purple":
      return {
        iconWrap: "bg-[#EEDBFF]",
        iconColor: "text-[#8F35E8]",
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
    case "approved":
      return <CircleCheck className={className} />;
    case "arrow":
      return <MoveDownRight className={className} />;
    case "truck":
      return <Truck className={className} />;
    default:
      return <Box className={className} />;
  }
}

type Props = {
  totalRequests: number;
  approvedRequests: number;
  lowStock: number;
  transitGoods: number;
};

export default function RequestStatCards({
  totalRequests,
  approvedRequests,
  lowStock,
  transitGoods,
}: Props) {
  const requestStats = [
    {
      id: "1",
      title: "Total Requests",
      value: totalRequests,
      tone: "gold",
      icon: "box",
      change: "+12.5%",
      changeTone: "green",
    },
    {
      id: "2",
      title: "Approved Requests",
      value: approvedRequests,
      tone: "green",
      icon: "approved",
      change: "+12.5%",
      changeTone: "red",
    },
    {
      id: "3",
      title: "Low Stock",
      value: lowStock,
      tone: "red",
      icon: "arrow",
    },
    {
      id: "4",
      title: "Transit Goods",
      value: transitGoods,
      tone: "purple",
      icon: "truck",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {requestStats.map((item) => {
        const tone = getToneClasses(item.tone);

        return (
          <div
            key={item.id}
            className="rounded-[24px] sm:rounded-[32px] border border-[#E4E7EC] bg-[#FCFCFD] px-4 py-4 shadow-[1px_1px_4px_0_#0000001A] sm:px-5 sm:py-5 xl:min-h-[166px]"
          >
            <div
              className={cn(
                "flex h-[48px] w-[48px] items-center justify-center rounded-[16px] sm:h-[50px] sm:w-[50px] sm:rounded-[18px]",
                tone.iconWrap
              )}
            >
              {getIcon(item.icon, cn("h-[20px] w-[20px] stroke-[1.9] sm:h-[22px] sm:w-[22px]", tone.iconColor))}
            </div>

            <div className="mt-5 sm:mt-6">
              <p className="text-[14px] font-[400] leading-[1.25] text-[#282828]">
                {item.title}
              </p>

              <div className="mt-3 flex items-end justify-between gap-3">
                <h3 className="text-[26px] font-semibold leading-[100%] text-[#000000] sm:text-[28px]">
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