"use client";

import { BadgeAlert, Box, Truck } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getTone(tone: string) {
  switch (tone) {
    case "gold":
      return {
        bg: "bg-[#FFF4CC]",
        icon: "text-[#B8860B]",
      };
    case "red":
      return {
        bg: "bg-[#FFE5E5]",
        icon: "text-[#FF3B30]",
      };
    case "purple":
      return {
        bg: "bg-[#F1DEFF]",
        icon: "text-[#9333EA]",
      };
    default:
      return {
        bg: "bg-[#F3F4F6]",
        icon: "text-[#111827]",
      };
  }
}

function getIcon(icon: string, className: string) {
  switch (icon) {
    case "badge":
      return <BadgeAlert className={className} />;
    case "truck":
      return <Truck className={className} />;
    default:
      return <Box className={className} />;
  }
}

function formatValue(title: string, value: number) {
  if (title === "Gold Price" || title === "Silver Price") {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  }

  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: Number(value) % 1 !== 0 ? 3 : 0,
    maximumFractionDigits: 3,
  });
}

type Props = {
  data?: {
    total_stock?: number;
    dead_stock_items?: number;
    transit_goods?: number;
    gold_price?: number;
    silver_price?: number;
  };
};

export default function StateCountCards({ data }: Props) {
  const stateCards = [
    {
      id: 1,
      title: "Total Stock",
      value: data?.total_stock || 0,
      icon: "box",
      tone: "gold",
    },
    {
      id: 2,
      title: "Dead Stock",
      value: data?.dead_stock_items || 0,
      icon: "badge",
      tone: "red",
    },
    {
      id: 3,
      title: "Transit Goods",
      value: data?.transit_goods || 0,
      icon: "truck",
      tone: "purple",
    },
    {
      id: 4,
      title: "Gold Price",
      value: data?.gold_price || 0,
      icon: "box",
      tone: "gold",
    },
    {
      id: 5,
      title: "Silver Price",
      value: data?.silver_price || 0,
      icon: "box",
      tone: "gold",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {stateCards.map((item) => {
        const tone = getTone(item.tone);

        return (
          <div
            key={item.id}
            className="rounded-[32px] border max-w-[204px] border-[#E5E7EB] bg-[#fff] px-4 py-2 shadow-[1px_1px_4px_0px_#0000001A]"
          >
            <div
              className={cn(
                "flex h-[52px] w-[52px] items-center justify-center rounded-[18px]",
                tone.bg
              )}
            >
              {getIcon(item.icon, cn("h-[22px] w-[22px] stroke-[1.8]", tone.icon))}
            </div>

            <div className="mt-5">
              <p className="text-[14px] font-[400] text-[#282828]">
                {item.title}
              </p>

              <h4 className="mt-0 text-[28px] font-[590] text-[#000000]">
                {formatValue(item.title, Number(item.value || 0))}
              </h4>
            </div>
          </div>
        );
      })}
    </div>
  );
}