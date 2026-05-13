"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconWrapClassName?: string;
};

export default function FinanceMetricCard({
  title,
  value,
  icon,
  iconWrapClassName = "bg-erp-primary-soft",
}: Props) {
  return (
    <div className="group h-[153px] w-full rounded-erp-xl border border-erp-border bg-erp-card px-4 py-4 shadow-erp-card transition duration-200 hover:-translate-y-[1px]  sm:h-[168px] sm:rounded-[30px] sm:px-[18px] sm:py-[18px] xl:h-[170px] xl:rounded-erp-2xl xl:px-5 xl:py-[18px]">
      <div
        className={[
          "flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-erp-sm",
          iconWrapClassName,
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="mt-[22px] sm:mt-[24px] xl:mt-[25px]">
        <p className="truncate text-[14px] font-normal leading-5 tracking-[-0.03em] text-erp-text-soft sm:text-[16px]">
          {title}
        </p>

        <div className="mt-[6px] flex min-w-0 items-end">
          <h3 className="min-w-0 truncate text-[28px] font-semibold leading-[34px] tracking-[-0.045em] text-erp-heading sm:text-[34px] sm:leading-[39px] xl:text-[36px] xl:leading-[42px]">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}