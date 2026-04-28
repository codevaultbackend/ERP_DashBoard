"use client";

import { CircleDollarSign, PackageCheck, Settings2, Truck } from "lucide-react";
import DashboardShellCard from "./DashboardShellCard";

type RecentActivity = {
  id?: string | number;
  title?: string;
  subtitle?: string;
  time?: string;
  tone?: string;
};

function getToneStyles(tone: string) {
  switch (tone) {
    case "blue":
      return {
        wrap: "bg-[#EAF2FF]",
        icon: <Truck className="h-[14px] w-[14px] text-[#3B82F6]" />,
      };
    case "green":
      return {
        wrap: "bg-[#E8FFF0]",
        icon: <PackageCheck className="h-[14px] w-[14px] text-[#22C55E]" />,
      };
    case "purple":
      return {
        wrap: "bg-[#F4E8FF]",
        icon: <Settings2 className="h-[14px] w-[14px] text-[#A855F7]" />,
      };
    default:
      return {
        wrap: "bg-[#FFF8DB]",
        icon: <CircleDollarSign className="h-[14px] w-[14px] text-[#EAB308]" />,
      };
  }
}

type Props = {
  data?: RecentActivity[];
};

export default function RecentActivitiesCard({ data = [] }: Props) {
  return (
    <DashboardShellCard
      title="Recent Activities"
      subtitle={
        data.length > 0
          ? "Latest System Activities and updates"
          : "No recent activities available"
      }
      className="shadow-[1px_1px_4px_0px_#0000001A]"
    >
      {data.length === 0 ? (
        <div className="flex min-h-[337px] items-center justify-center rounded-[16px] bg-[#F8FBFF] px-4 py-8 text-center text-[15px] font-medium text-[#98A2B3]">
          No recent activities found
        </div>
      ) : (
        <div className="space-y-3 h-[337px]">
          {data.map((item, index) => {
            const tone = getToneStyles(item.tone || "");

            return (
              <div
                key={item.id ?? index}
                className="flex items-start justify-between gap-3  rounded-[16px] bg-[#F8FBFF] px-3 py-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`mt-[2px] flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[8px] ${tone.wrap}`}
                  >
                    {tone.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-[#374151]">
                      {item.title || "Activity"}
                    </p>
                    <p className="truncate text-[13px] text-[#9CA3AF]">
                      {item.subtitle || "No details"}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-[13px] text-[#9CA3AF]">
                  {item.time || "--"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShellCard>
  );
}