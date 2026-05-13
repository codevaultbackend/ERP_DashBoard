"use client";

import type { ReactNode } from "react";

type SectionHeaderProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  action?: ReactNode;
  className?: string;
};

export default function SectionHeader({
  icon,
  title,
  subtitle,
  action,
  className = "bg-erp-card-soft",
}: SectionHeaderProps) {
  return (
    <div
      className={[
        "flex min-h-[78px] items-start justify-between gap-4 border-b border-erp-border px-4 py-4",
        "sm:min-h-[86px] sm:px-5 lg:px-6",
        className,
      ].join(" ")}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-[3px] shrink-0">{icon}</span>

        <div className="min-w-0">
          <h2 className="text-[17px] font-extrabold leading-[23px] tracking-[-0.035em] text-erp-heading sm:text-[20px] sm:leading-[26px]">
            {title}
          </h2>

          <p className="mt-1.5 text-[12px] font-medium leading-[17px] tracking-[-0.02em] text-erp-muted sm:text-[13px]">
            {subtitle}
          </p>
        </div>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}