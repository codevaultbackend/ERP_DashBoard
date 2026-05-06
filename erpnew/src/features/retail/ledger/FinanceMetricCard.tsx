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
  iconWrapClassName = "bg-[#DBEAFE]",
}: Props) {
  return (
    <div className="flex h-[110px] items-center rounded-[28px] border border-[#E1E5EA] bg-white px-[26px] shadow-[1px_1px_4px_0px_rgba(0,0,0,0.04)]">
      <div
        className={[
          "flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[14px]",
          iconWrapClassName,
        ].join(" ")}
      >
        {icon}
      </div>

      <div className="ml-[14px] min-w-0">
        <p className="text-[16px] font-normal leading-[20px] tracking-[-0.02em] text-[#4B5563]">
          {title}
        </p>
        <p className="mt-[6px] text-[30px] font-semibold leading-[32px] tracking-[-0.04em] text-[#101828]">
          {value}
        </p>
      </div>
    </div>
  );
}