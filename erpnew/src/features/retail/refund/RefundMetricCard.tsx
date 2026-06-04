"use client";

import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  RefreshCcw,
} from "lucide-react";
import { RefundStat } from "./refund-data";

type Props = {
  item: RefundStat;
};

function getIcon(type: RefundStat["iconType"]) {
  switch (type) {
    case "approved":
      return (
        <CheckCircle2
          className="h-6 w-6 text-[#16A34A]"
          strokeWidth={2.1}
        />
      );

    case "pending":
      return (
        <Clock3
          className="h-6 w-6 text-[#F97316]"
          strokeWidth={2.1}
        />
      );

    case "amount":
      return (
        <CircleDollarSign
          className="h-6 w-6 text-[#9333EA]"
          strokeWidth={2.1}
        />
      );

    default:
      return (
        <RefreshCcw
          className="h-6 w-6 text-[#3B82F6]"
          strokeWidth={2.1}
        />
      );
  }
}

export default function RefundMetricCard({
  item,
}: Props) {
  return (
    <div
      className="
        h-full
        min-h-[94px]
        rounded-[24px]
        border
        border-[#E5E7EB]
        bg-white
        px-5
        py-5
        shadow-erp-sm
        transition-all
        duration-200
        hover:shadow-erp-sm
        sm:px-6
        sm:py-6
      "
    >
      <div className="flex items-center gap-4">
        <div
          className={[
            "flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px]",
            item.iconWrapClassName,
          ].join(" ")}
        >
          {getIcon(item.iconType)}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="
              truncate
              text-[15px]
              font-medium
              text-[#667085]
              sm:text-[16px]
            "
          >
            {item.title}
          </p>

          <h3
            className="
              mt-1
              truncate
              text-[28px]
              font-semibold
              leading-none
              tracking-[-0.02em]
              text-[#111827]
              sm:text-[32px]
            "
          >
            {item.value}
          </h3>
        </div>
      </div>
    </div>
  );
}