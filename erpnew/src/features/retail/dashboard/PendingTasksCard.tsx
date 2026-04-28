"use client";

import { Clock3 } from "lucide-react";

type PendingTask = {
  id?: string | number;
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high" | string;
  status?: string;
  task_type?: string;
  reference_no?: string;
  store_name?: string;
  store_code?: string | null;
  district_code?: string | null;
  createdAt?: string;
};

type Props = {
  data?: PendingTask[];
  loading?: boolean;
};

function badgeClasses(priority?: string) {
  const value = priority?.toUpperCase();

  if (value === "HIGH") return "bg-[#FFE6E6] text-[#FF1F1F]";
  if (value === "MEDIUM") return "bg-[#FFF1DD] text-[#C2410C]";
  return "bg-[#DCFCE7] text-[#16A34A]";
}

function formatTaskType(type?: string) {
  if (!type) return "Task";

  return type
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTime(date?: string) {
  if (!date) return "--";

  const created = new Date(date).getTime();
  const diff = Math.max(0, Date.now() - created);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)} minutes ago`;
  if (diff < day) return `${Math.floor(diff / hour)} hours ago`;

  return `${Math.floor(diff / day)} days ago`;
}

export default function PendingTasksCard({ data = [], loading = false }: Props) {
  return (
    <section className="h-[337px] overflow-hidden rounded-[28px] border border-[#FF8F8F] bg-[#FFF5F5] px-[24px] pt-[20px] pb-[22px] shadow-[1px_1px_4px_0px_#0000001A]">
      <h3 className="text-[20px] font-semibold leading-[24px] tracking-[-0.02em] text-[#111827]">
        Pending Tasks - Requires Immediate Attention
      </h3>

      <p className="mt-[2px] text-[13px] leading-[18px] text-[#475569]">
        {loading
          ? "Loading pending tasks..."
          : `You have ${data.length} incomplete tasks that need your attention`}
      </p>

      <div className="dashboard-hidden-scroll mt-[20px] h-[234px] overflow-y-auto pr-[2px]">
        {loading ? (
          <div className="space-y-[10px]">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-[112px] animate-pulse rounded-[16px] bg-white shadow-[1px_1px_4px_0px_#0000001A]"
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-[16px] bg-white text-center shadow-[1px_1px_4px_0px_#0000001A]">
            <div>
              <p className="text-[15px] font-semibold text-[#111827]">
                No pending tasks
              </p>
              <p className="mt-1 text-[13px] text-[#64748B]">
                Everything is up to date.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-[10px]">
            {data.map((task, index) => (
              <article
                key={task.id ?? index}
                className="min-h-[112px] rounded-[16px] border border-[#EFEFEF] bg-white px-[17px] py-[14px] shadow-[1px_1px_4px_0px_#0000001A]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-[10px]">
                    <span
                      className={`inline-flex h-[25px] shrink-0 items-center justify-center rounded-[7px] px-[10px] text-[12px] font-semibold leading-none ${badgeClasses(
                        task.priority
                      )}`}
                    >
                      {(task.priority || "LOW").toUpperCase()}
                    </span>

                    <span className="truncate text-[13px] font-semibold text-[#334155]">
                      {formatTaskType(task.task_type)}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-[7px] pt-[2px] text-[13px] text-[#64748B]">
                    <Clock3 className="h-[14px] w-[14px]" strokeWidth={2} />
                    <span>{formatTime(task.createdAt)}</span>
                  </div>
                </div>

                <h4 className="mt-[11px] line-clamp-1 text-[17px] font-semibold leading-[23px] tracking-[-0.02em] text-[#111827]">
                  {task.title || "Untitled task"}
                </h4>

                <div className="mt-[7px] flex items-center justify-between gap-4">
                  <p className="line-clamp-1 min-w-0 text-[15px] leading-[21px] text-[#475569]">
                    {task.description || task.store_name || "No additional details"}
                  </p>

                  {task.reference_no ? (
                    <p className="shrink-0 text-[14px] font-semibold leading-[20px] text-[#FF1F1F]">
                      {task.reference_no}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}