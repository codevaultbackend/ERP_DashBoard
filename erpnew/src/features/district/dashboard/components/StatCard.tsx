import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  iconWrap: string;
  iconColor: string;
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconWrap,
  iconColor,
}: StatCardProps) {
  return (
    <div className="min-h-[150px] rounded-[28px] border border-[#E5E7EB] bg-white px-4 py-4 shadow-[0_2px_8px_rgba(15,23,42,0.05)]">
      <div
        className={[
          "flex h-[50px] w-[50px] items-center justify-center rounded-[16px]",
          iconWrap,
        ].join(" ")}
      >
        <Icon className={["h-[22px] w-[22px]", iconColor].join(" ")} />
      </div>

      <div className="mt-5 min-w-0">
        <p className="truncate text-[14px] font-medium text-[#3F3F46]">
          {title}
        </p>
        <h3 className="mt-1 truncate text-[28px] font-semibold leading-none tracking-[-0.04em] text-black">
          {value}
        </h3>
      </div>
    </div>
  );
}