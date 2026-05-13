"use client";

import type { ReactNode } from "react";

type MetricCardProps = {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  iconBg: string;
};

export default function MetricCard({
  title,
  value,
  icon,
  iconBg,
}: MetricCardProps) {
  return (
    <div className="min-h-[86px] rounded-erp-md border border-erp-border bg-erp-card px-4 py-4 shadow-erp-card sm:min-h-[90px] sm:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div
          className={[
            "flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-erp-xs",
            "sm:h-[42px] sm:w-[42px]",
            iconBg,
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium leading-[18px] tracking-[-0.02em] text-erp-muted sm:text-[13px]">
            {title}
          </p>

          <div className="mt-1 truncate text-[18px] font-extrabold leading-[24px] tracking-[-0.04em] text-erp-heading sm:text-[20px]">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}