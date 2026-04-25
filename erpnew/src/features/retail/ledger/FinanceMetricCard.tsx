"use client";

import React from "react";

type Props = {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconWrapClassName: string;
};

export default function FinanceMetricCard({
  title,
  value,
  icon,
  iconWrapClassName,
}: Props) {
  return (
    <div className="rounded-[24px] border border-[#E3E6EB] bg-white px-4 py-4 shadow-[0px_2px_10px_rgba(15,23,42,0.02)] sm:px-6 sm:py-6">
      <div className="flex items-center gap-4">
        <div
          className={[
            "flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px]",
            iconWrapClassName,
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[15px] font-medium text-[#5B6475] sm:text-[16px]">
            {title}
          </p>
          <h3 className="mt-1 text-[18px] font-semibold leading-none text-[#111827] sm:text-[20px]">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
}