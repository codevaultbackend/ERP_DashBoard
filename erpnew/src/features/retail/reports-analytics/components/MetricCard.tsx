"use client";

import React from "react";

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconWrapClassName: string;
};

export default function MetricCard({
  title,
  value,
  icon,
  iconWrapClassName,
}: MetricCardProps) {
  return (
    <div className="rounded-[22px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0px_4px_18px_rgba(15,23,42,0.03)] sm:rounded-[24px] sm:px-5 sm:py-5 lg:rounded-[28px] lg:px-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className={[
            "flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[12px] sm:h-[48px] sm:w-[48px] sm:rounded-[13px] lg:h-[50px] lg:w-[50px] lg:rounded-[14px]",
            iconWrapClassName,
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="truncate text-[13px] leading-none text-[#6B7280] sm:text-[14px] lg:text-[16px]">
            {title}
          </p>
          <h3 className="mt-2 text-[18px] font-semibold leading-none text-[#111827] sm:text-[19px] lg:text-[20px]">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}