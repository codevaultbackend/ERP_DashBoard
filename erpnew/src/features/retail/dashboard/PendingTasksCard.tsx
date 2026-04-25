"use client";

import { Clock3 } from "lucide-react";
import DashboardShellCard from "./DashboardShellCard";

type PendingTask = {
  id?: string | number;
  level?: string;
  category?: string;
  time?: string;
  title?: string;
  subtitle?: string;
  amount?: string | number;
};

function badgeClasses(level: string) {
  if (level === "HIGH") {
    return "bg-[#FFE2E0] text-[#E53935]";
  }
  if (level === "MEDIUM") {
    return "bg-[#FFE7CC] text-[#D97706]";
  }
  return "bg-[#E8F5E9] text-[#16A34A]";
}

type Props = {
  data?: PendingTask[];
};

export default function PendingTasksCard({ data = [] }: Props) {
  const taskCount = data.length;

  return (
    <DashboardShellCard
      title="Pending Tasks - Requires Immediate Attention"
      subtitle={
        taskCount > 0
          ? `You have ${taskCount} incomplete task${taskCount > 1 ? "s" : ""} that need your attention`
          : "No pending tasks right now"
      }
      className="border-[#FF9B9B] bg-[#FFF7F7] shadow-[1px_1px_4px_0px_#0000001A]"
    >
      {taskCount === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-[22px] border border-[#EFEFEF] bg-white px-4 py-8 text-center text-[15px] font-medium text-[#98A2B3]">
          No pending tasks available
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((task, index) => (
            <div
              key={task.id ?? index}
              className="rounded-[22px] border border-[#EFEFEF] bg-white px-4 py-4 shadow-[0px_2px_10px_rgba(15,23,42,0.03)] sm:px-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  {task.level ? (
                    <span
                      className={`inline-flex rounded-[10px] px-3 py-[5px] text-[13px] font-semibold ${badgeClasses(
                        task.level
                      )}`}
                    >
                      {task.level}
                    </span>
                  ) : null}

                  {task.category ? (
                    <span className="truncate text-[14px] font-medium text-[#4B5563]">
                      {task.category}
                    </span>
                  ) : null}
                </div>

                {task.time ? (
                  <div className="flex shrink-0 items-center gap-2 text-[14px] text-[#6B7280]">
                    <Clock3 className="h-[15px] w-[15px]" />
                    <span>{task.time}</span>
                  </div>
                ) : null}
              </div>

              <h4 className="mt-3 text-[18px] font-medium tracking-[-0.02em] text-[#111827]">
                {task.title || "Untitled Task"}
              </h4>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[14px] text-[#667085]">
                  {task.subtitle || "No additional details"}
                </p>

                {task.amount !== undefined && task.amount !== null && task.amount !== "" ? (
                  <p className="text-[16px] font-semibold text-[#FF2F2F]">
                    {task.amount}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShellCard>
  );
}