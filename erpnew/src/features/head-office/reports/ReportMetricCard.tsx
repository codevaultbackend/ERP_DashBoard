"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconWrapClassName?: string;
  growth?: string |number;
};

export default function ReportMetricCard({
  title,
  value,
  icon,
  iconWrapClassName = "bg-erp-primary-soft",
  growth,
}: Props) {
  const growthText =
    growth === undefined || growth === null ? "" : String(growth);

  const isPositiveGrowth =
    growthText.length > 0 && !growthText.includes("-");

  return (
    <div className="flex h-[132px] w-full flex-col justify-between rounded-[26px] border border-erp-border bg-erp-card px-4 py-4 shadow-erp-card sm:h-[138px] sm:px-6 sm:py-5 xl:h-[142px] xl:rounded-erp-2xl">
      {/* Icon */}
      <div
        className={[
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-erp-sm sm:h-[50px] sm:w-[50px] mb-[10px]",
          iconWrapClassName,
        ].join(" ")}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0">
        <p className="truncate text-[13px] font-normal leading-[100%] tracking-[-0.03em] text-erp-text-soft max-[768px]:text-[14px] sm:leading-[100%]">
          {title}
        </p>

        <div className="mt-1 flex items-end justify-between gap-2">
          {/* Value */}
          <h3
            className="
              min-w-0
              flex-1
              mt-[8px]
              whitespace-nowrap
              text-[20px]
              font-semibold
              leading-[100%]
              tracking-[0%]
              text-erp-heading
              sm:text-[28px]
              sm:leading-[100%]
              xl:text-[28px]
              xl:leading-[100%]
            "
          >
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}