"use client";

import { useMemo } from "react";
import DashboardCard from "./DashboardCard";
import {
  BellRing,
  CircleDollarSign,
  Settings2,
  ShieldAlert,
  Truck,
} from "lucide-react";

type ActivityRow = {
  title: string;
  description: string;
  time: string;
};

type Props = {
  activities?: ActivityRow[];
};

/**
 * ✅ Tone + Icon mapping based on title
 */
const toneMap = {
  stock: {
    wrap: "bg-erp-blue-soft",
    icon: "text-erp-primary",
    Icon: Truck,
  },
  sales: {
    wrap: "bg-erp-success-soft",
    icon: "text-erp-success",
    Icon: CircleDollarSign,
  },
  transit: {
    wrap: "bg-erp-purple-soft",
    icon: "text-erp-purple",
    Icon: Settings2,
  },
  alert: {
    wrap: "bg-erp-danger-soft",
    icon: "text-erp-danger",
    Icon: ShieldAlert,
  },
  default: {
    wrap: "bg-erp-yellow-soft",
    icon: "text-erp-yellow",
    Icon: BellRing,
  },
} as const;

/**
 * ✅ Detect tone from title
 */
function getTone(title: string) {
  const t = title.toLowerCase();

  if (t.includes("stock")) return toneMap.stock;
  if (t.includes("sale")) return toneMap.sales;
  if (t.includes("transit")) return toneMap.transit;

  return toneMap.default;
}

/**
 * ✅ Format time (e.g. "2 min ago")
 */
function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

/**
 * ✅ Normalize + sort data
 */
function normalizeActivities(data?: ActivityRow[]) {
  if (!Array.isArray(data)) return [];

  return data
    .map((item, index) => ({
      id: `${item.time}-${index}`, // unique key
      title: item.title,
      subtitle: item.description,
      time: item.time,
      displayTime: formatTime(item.time),
      tone: getTone(item.title),
    }))
    .sort(
      (a, b) =>
        new Date(b.time).getTime() - new Date(a.time).getTime()
    ); // latest first
}

export default function RecentActivitiesCard({ activities = [] }: Props) {
  const safeActivities = useMemo(
    () => normalizeActivities(activities),
    [activities]
  );

  return (
    <DashboardCard title="Recent Activities" className="h-full">
      <p className="-mt-2 px-3 text-[13px] text-erp-muted sm:px-4">
        Latest system activities and updates
      </p>

      <div className="mt-4 max-h-[330px] space-y-3 overflow-y-auto px-1 pr-2 sm:px-2">
        {safeActivities.length ? (
          safeActivities.map((item) => {
            const config = item.tone;
            const Icon = config.Icon;

            return (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-erp-sm bg-erp-card-soft px-4 py-3"
              >
                {/* Left */}
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-erp-xs ${config.wrap}`}
                  >
                    <Icon size={16} className={config.icon} strokeWidth={2} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-erp-text">
                      {item.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[12px] text-erp-muted">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <p className="shrink-0 pt-1 text-[12px] text-erp-muted">
                  {item.displayTime}
                </p>
              </div>
            );
          })
        ) : (
          <div className="rounded-erp-sm bg-erp-card-soft px-4 py-6 text-center text-[14px] text-erp-muted">
            No recent activities found
          </div>
        )}
      </div>
    </DashboardCard>
  );
}