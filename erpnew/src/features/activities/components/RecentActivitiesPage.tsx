"use client";

import {
  BadgeIndianRupee,
  Clock3,
  Gem,
  ReceiptText,
  Store,
  UserRound,
} from "lucide-react";

type ActivityItem = {
  id: number;
  type: "stock" | "bill" | "staff";
  title: string;
  description: string;
  store: string;
  handledBy: string;
  time: string;
  date: string;
  ago: string;
};

const activities: ActivityItem[] = [
  {
    id: 1,
    type: "stock",
    title: "STOCK ENTRY",
    description: "10 Gold Necklaces",
    store: "Central Vault A",
    handledBy: "Marcus Sterling",
    time: "14:30 PM",
    date: "OCT 24, 2023",
    ago: "5 minutes ago",
  },
  {
    id: 2,
    type: "bill",
    title: "BILL GENERATED",
    description: "Gold Ring A24",
    store: "Vaishali Store 1",
    handledBy: "Parag Sharma",
    time: "14:30 PM",
    date: "OCT 24, 2023",
    ago: "5 minutes ago",
  },
  {
    id: 3,
    type: "staff",
    title: "STAFF ENROLLED",
    description: "2 Sales girls registered",
    store: "Central Vault A",
    handledBy: "Marcus Sterling",
    time: "14:30 PM",
    date: "OCT 24, 2023",
    ago: "5 minutes ago",
  },
  {
    id: 4,
    type: "stock",
    title: "STOCK ENTRY",
    description: "10 Gold Necklaces",
    store: "Central Vault A",
    handledBy: "Marcus Sterling",
    time: "14:30 PM",
    date: "OCT 24, 2023",
    ago: "5 minutes ago",
  },
  {
    id: 5,
    type: "stock",
    title: "STOCK ENTRY",
    description: "10 Gold Necklaces",
    store: "Central Vault A",
    handledBy: "Marcus Sterling",
    time: "14:30 PM",
    date: "OCT 24, 2023",
    ago: "5 minutes ago",
  },
  {
    id: 6,
    type: "stock",
    title: "STOCK ENTRY",
    description: "10 Gold Necklaces",
    store: "Central Vault A",
    handledBy: "Marcus Sterling",
    time: "14:30 PM",
    date: "OCT 24, 2023",
    ago: "5 minutes ago",
  },
  {
    id: 7,
    type: "stock",
    title: "STOCK ENTRY",
    description: "10 Gold Necklaces",
    store: "Central Vault A",
    handledBy: "Marcus Sterling",
    time: "14:30 PM",
    date: "OCT 24, 2023",
    ago: "5 minutes ago",
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ActivityMetaIcon({ type }: { type: ActivityItem["type"] }) {
  if (type === "bill") {
    return <ReceiptText className="h-[11px] w-[11px] text-[#7B8494]" strokeWidth={2.15} />;
  }

  if (type === "staff") {
    return <UserRound className="h-[11px] w-[11px] text-[#7B8494]" strokeWidth={2.15} />;
  }

  return <Gem className="h-[11px] w-[11px] text-[#7B8494]" strokeWidth={2.15} />;
}

function ActivityLeadingIcon({ type }: { type: ActivityItem["type"] }) {
  if (type === "bill") {
    return <ReceiptText className="h-[17px] w-[17px] text-[#2458D3]" strokeWidth={2.1} />;
  }

  if (type === "staff") {
    return <UserRound className="h-[17px] w-[17px] text-[#2458D3]" strokeWidth={2.1} />;
  }

  return <Gem className="h-[17px] w-[17px] text-[#2458D3]" strokeWidth={2.1} />;
}

function ActivityField({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center gap-[6px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[#6F7787] md:text-[12px]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-[7px] text-[15px] font-medium leading-[1.2] text-[#212833] md:text-[16px]">
        {value}
      </div>
    </div>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  return (
    <article
      className={cn(
        "relative w-full rounded-[24px] border bg-white",
        "border-[#9EBBFF] shadow-[0px_1px_2px_rgba(17,24,39,0.02)]",
        "px-[16px] py-[16px]",
        "sm:rounded-[26px] sm:px-[22px] sm:py-[18px]",
        "xl:min-h-[95px] xl:px-[28px] xl:py-[20px]"
      )}
    >
      <div className="absolute right-[16px] top-[12px] text-[11px] font-medium text-[#A3A9B5] sm:right-[20px] xl:right-[22px]">
        {item.ago}
      </div>

      <div className="flex flex-col gap-4 pr-[64px] md:pr-[82px] xl:grid xl:grid-cols-[280px_220px_220px_minmax(220px,1fr)] xl:items-center xl:gap-[26px] xl:pr-[96px]">
        <div className="flex min-w-0 items-center gap-[14px]">
          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-[#E8F0FE] sm:h-[40px] sm:w-[40px] sm:rounded-[12px]">
            <ActivityLeadingIcon type={item.type} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-[5px] text-[11px] font-semibold uppercase tracking-[0.02em] text-[#6F7787] md:text-[12px]">
              <ActivityMetaIcon type={item.type} />
              <span>{item.title}</span>
            </div>

            <p className="mt-[7px] truncate text-[15px] font-medium leading-[1.15] text-[#202733] sm:text-[16px] xl:text-[17px]">
              {item.description}
            </p>
          </div>
        </div>

        <ActivityField
          icon={<Store className="h-[12px] w-[12px] text-[#6F7787]" strokeWidth={2.2} />}
          label="MAIN STORE"
          value={<span className="truncate">{item.store}</span>}
        />

        <ActivityField
          icon={<UserRound className="h-[12px] w-[12px] text-[#6F7787]" strokeWidth={2.2} />}
          label="HANDLED BY"
          value={<span className="truncate">{item.handledBy}</span>}
        />

        <ActivityField
          icon={<Clock3 className="h-[12px] w-[12px] text-[#6F7787]" strokeWidth={2.2} />}
          label="DATE & TIME"
          value={
            <div className="flex flex-wrap items-center gap-x-[14px] gap-y-[2px]">
              <span>{item.time}</span>
              <span>{item.date}</span>
            </div>
          }
        />
      </div>
    </article>
  );
}

export default function RecentActivitiesPage() {
  return (
    <main className="min-w-0 flex-1">
      <section className="w-full">
        <div className="max-w-full">
          <h1 className="text-[32px] font-semibold leading-[1.04] tracking-[-0.04em] text-[#182235] sm:text-[40px] lg:text-[48px] xl:text-[54px]">
            Recent Activities Performed
          </h1>

          <p className="mt-[10px] max-w-[780px] text-[15px] font-normal leading-[1.35] text-[#697586] sm:text-[17px] lg:text-[18px]">
            All updates regarding recent entries , updates and login and out
          </p>
        </div>

        <div className="mt-[26px] space-y-[18px] sm:mt-[30px] sm:space-y-[18px] xl:mt-[28px] xl:space-y-[19px]">
          {activities.map((item) => (
            <ActivityCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </main>
  );
}