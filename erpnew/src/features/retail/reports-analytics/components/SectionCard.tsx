"use client";

import React from "react";

type SectionCardProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  headerClassName?: string;
  bodyClassName?: string;
};

export default function SectionCard({
  title,
  subtitle,
  icon,
  children,
  action,
  headerClassName = "",
  bodyClassName = "",
}: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-[22px] border border-[#E5E7EB] bg-white shadow-[0px_6px_22px_rgba(15,23,42,0.04)] sm:rounded-[26px] lg:rounded-[30px]">
      <div
        className={[
          "flex flex-col gap-4 border-b border-[#E5E7EB] px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-start lg:justify-between lg:px-6",
          headerClassName,
        ].join(" ")}
      >
        <div className="min-w-0">
          <div className="flex items-start gap-3">
            <span className="mt-[2px] shrink-0">{icon}</span>
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold tracking-[-0.03em] text-[#111827] sm:text-[18px] lg:text-[20px]">
                {title}
              </h2>
              <p className="mt-1.5 text-[12px] leading-[1.45] text-[#6B7280] sm:text-[13px] lg:mt-2 lg:text-[14px]">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {action ? <div className="shrink-0 self-start lg:self-auto">{action}</div> : null}
      </div>

      <div className={bodyClassName}>{children}</div>
    </section>
  );
}