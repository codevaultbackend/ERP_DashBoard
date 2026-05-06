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
        "rounded-erp-2xl border border-erp-border bg-erp-card shadow-erp-card",
        "overflow-hidden",
        className,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4 px-5 pb-0 pt-5 sm:px-6 sm:pt-6">
        <h3 className="erp-card-title">{title}</h3>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="px-3 pb-3 pt-4 sm:px-4 sm:pb-4 sm:pt-5">
        {children}
      </div>
    </section>
  );
}