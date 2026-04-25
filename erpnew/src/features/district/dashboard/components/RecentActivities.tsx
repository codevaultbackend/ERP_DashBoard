import { recentActivities } from "../../data/district-dashboard-data";
import SectionCard from "./SectionCard";

export default function RecentActivities() {
  return (
    <SectionCard
      title="Recent Activities"
      subtitle="Latest System Activities and updates"
      className="h-full"
    >
      <div className="space-y-3">
        {recentActivities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div
              key={`${activity.title}-${activity.time}`}
              className="flex flex-col gap-3 rounded-[14px] bg-[#F8FAFC] px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:rounded-[16px] sm:px-4"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className={[
                    "mt-0.5 flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[9px] sm:h-[30px] sm:w-[30px] sm:rounded-[10px]",
                    activity.iconWrap,
                  ].join(" ")}
                >
                  <Icon
                    className={["h-[14px] w-[14px] sm:h-[15px] sm:w-[15px]", activity.iconColor].join(" ")}
                  />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium leading-[18px] text-[#3F3F46] sm:text-[14px]">
                    {activity.title}
                  </p>
                  <p className="mt-[2px] text-[11px] leading-[15px] text-[#A3A3A3] sm:text-[12px] sm:leading-[16px]">
                    {activity.subtitle}
                  </p>
                </div>
              </div>

              <p className="pl-[40px] text-[11px] leading-[15px] text-[#A3A3A3] sm:shrink-0 sm:pl-0 sm:pt-[2px] sm:text-[12px] sm:leading-[16px]">
                {activity.time}
              </p>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}