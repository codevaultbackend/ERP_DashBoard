import type { ReactNode } from "react";

export default function ReportCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-erp-xl border border-erp-border bg-erp-card shadow-erp-card ${className}`}
    >
      {children}
    </div>
  );
}