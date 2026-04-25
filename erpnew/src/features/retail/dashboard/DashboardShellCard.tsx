"use client";

import { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function DashboardShellCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: Props) {
  return (
    <section
      className={[
        "rounded-[30px] border border-[#E5E7EB] bg-[#FCFCFD]",
        "shadow-[0px_4px_18px_rgba(15,23,42,0.04)]",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-[18px] font-semibold tracking-[-0.03em] text-[#111827] sm:text-[20px]">
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-[13px] leading-[1.35] text-[#98A2B3]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="px-3 pb-3 pt-4 sm:px-4 sm:pb-4 sm:pt-5">{children}</div>
    </section>
  );
}