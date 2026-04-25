"use client";

import { ReactNode } from "react";

export default function DashboardCard({
  title,
  action,
  className = "",
  children,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={[
        "rounded-[32px] border border-[#E7E9EE] bg-[#FCFCFD]",
        "shadow-[0px_10px_30px_rgba(17,24,39,0.04),0px_2px_8px_rgba(17,24,39,0.03)]",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4 px-5 pb-0 pt-5 sm:px-6 sm:pt-6">
        <h3 className="text-[20px] font-semibold leading-none tracking-[-0.03em] text-[#1F2937]">
          {title}
        </h3>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="px-3 pb-3 pt-4 sm:px-4 sm:pb-4 sm:pt-5">{children}</div>
    </section>
  );
}