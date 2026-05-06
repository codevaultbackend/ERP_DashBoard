import type { ReactNode } from "react";

export default function SectionHeader({
  icon,
  title,
  subtitle,
  className = "",
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div
      className={`border-b border-erp-border px-[22px] py-[18px] ${className}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <h2 className="truncate text-[18px] font-bold tracking-[-0.03em] text-erp-heading">
          {title}
        </h2>
      </div>

      <p className="mt-[4px] truncate text-[13px] font-medium text-erp-muted">
        {subtitle}
      </p>
    </div>
  );
}