"use client";

import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  iconClassName?: string;
  headerClassName?: string;
  heightClassName?: string;
  children: ReactNode;
};

export default function ReportChartCard({
  title,
  subtitle,
  icon,
  iconClassName = "text-erp-primary",
  headerClassName = "bg-erp-primary-soft",
  heightClassName = "h-[330px] sm:h-[380px] xl:h-[420px]",
  children,
}: Props) {
  return (
    <section className="overflow-hidden rounded-erp-2xl border border-erp-border bg-erp-card shadow-erp-card">
      <div
        className={[
          "border-b border-erp-border px-4 py-3 sm:px-5 sm:py-4",
          headerClassName,
        ].join(" ")}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className={["inline-flex shrink-0", iconClassName].join(" ")}>
            {icon}
          </span>

          <h2 className="truncate text-[17px] font-semibold leading-[23px] tracking-[-0.035em] text-erp-heading sm:text-[20px] sm:leading-[26px]">
            {title}
          </h2>
        </div>

        <p className="mt-[2px] text-[12px] font-normal leading-[18px] tracking-[-0.02em] text-erp-muted sm:text-[14px]">
          {subtitle}
        </p>
      </div>

      <div
        className={[
          "bg-erp-card px-2 py-4 sm:px-4 sm:py-5",
          heightClassName,
        ].join(" ")}
      >
        {children}
      </div>
    </section>
  );
}