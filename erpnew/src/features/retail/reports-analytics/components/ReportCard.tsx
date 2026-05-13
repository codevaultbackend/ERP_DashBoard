"use client";

import type { ReactNode } from "react";

type ReportCardProps = {
  children: ReactNode;
  className?: string;
};

export default function ReportCard({ children, className = "" }: ReportCardProps) {
  return (
    <section
      className={[
        "min-w-0 overflow-hidden rounded-erp-lg border border-erp-border bg-erp-card shadow-erp-card",
        "sm:rounded-erp-xl",
        className,
      ].join(" ")}
    >
      {children}
    </section>
  );
}