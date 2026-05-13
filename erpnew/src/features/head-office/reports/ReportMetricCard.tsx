"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconWrapClassName?: string;
  growth?: string | number;
};

export default function ReportMetricCard({
  title,
  value,
  icon,
  iconWrapClassName = "bg-erp-primary-soft",
  growth,
}: Props) {
  const growthText = growth === undefined || growth === null ? "" : String(growth);
  const isPositiveGrowth = growthText && !growthText.includes("-");

  return (
    <div className="flex h-[132px] w-full flex-col justify-between rounded-[26px] border border-erp-border bg-erp-card px-[22px] py-[18px] shadow-erp-card sm:h-[138px] sm:rounded-[28px] sm:px-[24px] sm:py-[20px] xl:h-[142px] xl:rounded-erp-2xl">
      <div
        className={[
          "flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-erp-sm sm:h-[50px] sm:w-[50px]",
          iconWrapClassName,
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="truncate text-[15px] font-normal leading-[20px] tracking-[-0.03em] text-erp-text-soft sm:text-[16px]">
          {title}
        </p>

        <div className="mt-[2px] flex min-w-0 items-end justify-between gap-2">
          <h3 className="truncate text-[27px] font-semibold leading-[32px] tracking-[-0.045em] text-erp-heading sm:text-[30px] sm:leading-[35px] xl:text-[32px] xl:leading-[38px]">
            {value}
          </h3>

          {growthText ? (
            <span
              className={[
                "mb-1 shrink-0 text-[14px] font-semibold leading-[18px]",
                isPositiveGrowth ? "text-erp-success" : "text-erp-danger",
              ].join(" ")}
            >
              {growthText}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}