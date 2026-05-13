import type { ReactNode } from "react";
import { cn } from "../utils";

type ChartCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  iconClass?: string;
  headerClass?: string;
  children: ReactNode;
};

export default function ChartCard({
  title,
  subtitle,
  icon,
  iconClass,
  headerClass,
  children,
}: ChartCardProps) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#E8EAEE] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.035)]">
      <div
        className={cn(
          "border-b border-[#EEF0F3] px-[22px] py-[18px]",
          headerClass
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center",
              iconClass
            )}
          >
            {icon}
          </span>

          <h2 className="text-[18px] font-bold leading-[24px] tracking-[-0.03em] text-[#111827]">
            {title}
          </h2>
        </div>

        <p className="mt-[4px] text-[13px] font-normal leading-[18px] text-[#667085]">
          {subtitle}
        </p>
      </div>

      <div className="p-[22px]">{children}</div>
    </section>
  );
}