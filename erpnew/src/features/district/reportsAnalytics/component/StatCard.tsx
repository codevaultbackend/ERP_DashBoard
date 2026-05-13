import type { ElementType } from "react";
import { cn } from "../utils";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ElementType;
  iconWrap: string;
  iconClass: string;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconWrap,
  iconClass,
}: StatCardProps) {
  return (
    <div className="flex h-[88px] items-center gap-4 rounded-[22px] border border-[#E8EAEE] bg-white px-[22px] shadow-[0_8px_24px_rgba(16,24,40,0.035)]">
      <div
        className={cn(
          "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[8px]",
          iconWrap
        )}
      >
        <Icon className={cn("h-[20px] w-[20px]", iconClass)} />
      </div>

      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium leading-[18px] text-[#667085]">
          {label}
        </p>
        <p className="mt-[2px] truncate text-[20px] font-bold leading-[26px] tracking-[-0.03em] text-[#101828]">
          {value}
        </p>
      </div>
    </div>
  );
}