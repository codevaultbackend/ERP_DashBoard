import { LucideIcon } from "lucide-react";

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
    <div className="rounded-[20px] border border-[#D9D9D9] bg-white px-4 py-4 shadow-[0px_2px_8px_rgba(15,23,42,0.04)] sm:rounded-[24px] sm:px-[18px] sm:py-[18px] lg:rounded-[28px]">
      <div
        className={[
          "flex h-[44px] w-[44px] items-center justify-center rounded-[14px] sm:h-[48px] sm:w-[48px] sm:rounded-[16px]",
          iconWrap,
        ].join(" ")}
      >
        <Icon
          className={["h-[20px] w-[20px] sm:h-[22px] sm:w-[22px]", iconColor].join(" ")}
          strokeWidth={1.9}
        />
      </div>

      <div className="mt-4 sm:mt-5">
        <p className="text-[13px] font-medium leading-[18px] text-[#3F3F46] sm:text-[14px] sm:leading-[20px]">
          {title}
        </p>
        <h3 className="mt-1 text-[22px] font-semibold leading-[26px] tracking-[-0.03em] text-[#111111] sm:text-[24px] sm:leading-[28px]">
          {value}
        </h3>
      </div>
    </div>
  );
}