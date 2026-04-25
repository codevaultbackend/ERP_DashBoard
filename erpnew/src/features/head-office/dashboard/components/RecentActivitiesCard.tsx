"use client";

import DashboardCard from "./DashboardCard";
import { recentActivities } from "../data/retail-dashboard-data";
import {
    BellRing,
    CircleDollarSign,
    Settings2,
    ShieldAlert,
    Truck,
} from "lucide-react";

const toneMap = {
    blue: {
        wrap: "bg-[#EAF2FF]",
        icon: "text-[#4C8DFF]",
        Icon: Truck,
    },
    green: {
        wrap: "bg-[#EAFBF0]",
        icon: "text-[#41C968]",
        Icon: BellRing,
    },
    purple: {
        wrap: "bg-[#F2EAFE]",
        icon: "text-[#B06CFF]",
        Icon: Settings2,
    },
    yellow: {
        wrap: "bg-[#FFF9E8]",
        icon: "text-[#D8B11E]",
        Icon: CircleDollarSign,
    },
    red: {
        wrap: "bg-[#FDECEC]",
        icon: "text-[#F87171]",
        Icon: ShieldAlert,
    },
} as const;

export default function RecentActivitiesCard() {
    return (
        <DashboardCard
            title="Recent Activities"
            className="h-full"
            action={null}
        >
            <p className="-mt-2 px-3 text-[13px] text-[#A1A8B3] sm:px-4">
                Latest System Activities and updates
            </p>

            <div className="mt-4 space-y-3 px-1 sm:px-2">
                {recentActivities.map((item) => {
                    const config = toneMap[item.tone as keyof typeof toneMap];
                    const Icon = config.Icon;

                    return (
                        <div
                            key={item.id}
                            className="flex items-start justify-between gap-3 rounded-[18px] bg-[#F7F9FB] px-4 py-3"
                        >
                            <div className="flex min-w-0 items-start gap-3">
                                <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${config.wrap}`}
                                >
                                    <Icon size={16} className={config.icon} strokeWidth={2} />
                                </div>

                                <div className="min-w-0">
                                    <p className="truncate text-[14px] font-medium text-[#374151]">
                                        {item.title}
                                    </p>
                                    <p className="mt-1 text-[12px] text-[#9CA3AF]">
                                        {item.subtitle}
                                    </p>
                                </div>
                            </div>

                            <p className="shrink-0 pt-1 text-[12px] text-[#9CA3AF]">
                                {item.time}
                            </p>
                        </div>
                    );
                })}
            </div>
        </DashboardCard>
    );
}