"use client";

import {
  Bell,
  CircleUserRound,
  RefreshCw,
  Settings2,
  Wallet,
} from "lucide-react";
import SectionCard from "./SectionCard";

type Props = {
  data: {
    id: number;
    title: string;
    subtitle: string;
    time_ago: string;
  }[];
};

const iconStyles = [
  {
    icon: CircleUserRound,
    iconWrap: "bg-[#E7F0FF]",
    iconColor: "text-[#5B8DEF]",
  },
  {
    icon: RefreshCw,
    iconWrap: "bg-[#E8F8EA]",
    iconColor: "text-[#34C759]",
  },
  {
    icon: Settings2,
    iconWrap: "bg-[#F2E8FF]",
    iconColor: "text-[#A855F7]",
  },
  {
    icon: Wallet,
    iconWrap: "bg-[#FFF6D7]",
    iconColor: "text-[#E5B800]",
  },
  {
    icon: Bell,
    iconWrap: "bg-[#FFE8E8]",
    iconColor: "text-[#FF1F1F]",
  },
];

export default function RecentActivities({ data }: Props) {
  return (
    <SectionCard
      title="Recent Activities"
      subtitle="Latest System Activities and updates"
      className="h-full"
    >
      <div className="max-h-[330px] space-y-3 overflow-y-auto pr-1">
        {data.length === 0 ? (
          <div className="rounded-[16px] bg-[#F8FAFC] px-4 py-5 text-[13px] text-[#71717A]">
            No recent activities found.
          </div>
        ) : (
          data.map((activity, index) => {
            const style = iconStyles[index % iconStyles.length];
            const Icon = style.icon;

            return (
              <div
                key={activity.id || index}
                className="flex items-start justify-between gap-3 rounded-[14px] bg-[#F8FAFC] px-3 py-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={[
                      "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px]",
                      style.iconWrap,
                    ].join(" ")}
                  >
                    <Icon
                      className={[
                        "h-[15px] w-[15px]",
                        style.iconColor,
                      ].join(" ")}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium leading-[18px] text-[#3F3F46]">
                      {activity.title || "Activity"}
                    </p>
                    <p className="mt-[2px] line-clamp-2 text-[12px] leading-[16px] text-[#A3A3A3]">
                      {activity.subtitle || "-"}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 pt-[2px] text-[12px] leading-[16px] text-[#A3A3A3]">
                  {activity.time_ago || ""}
                </p>
              </div>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}