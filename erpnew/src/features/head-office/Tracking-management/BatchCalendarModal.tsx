"use client";

import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelectDate: (
    date: string
  ) => void;
  availableDates?: string[];
}

export default function BatchCalendarModal({
  open,
  onClose,
  onSelectDate,
  availableDates = [],
}: Props) {
  const [currentMonth, setCurrentMonth] =
    useState(new Date());

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  useEffect(() => {
    const handleEsc = (
      e: KeyboardEvent
    ) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEsc
    );

    return () =>
      document.removeEventListener(
        "keydown",
        handleEsc
      );
  }, [onClose]);

  const availableDateSet = useMemo(
    () =>
      new Set(
        availableDates.map(
          (d) => d.split("T")[0]
        )
      ),
    [availableDates]
  );
  useEffect(() => {
    if (!open || !availableDates.length)
      return;

    const sortedDates = [...availableDates].sort(
      (a, b) =>
        new Date(a).getTime() -
        new Date(b).getTime()
    );

    setCurrentMonth(
      new Date(sortedDates[0])
    );
  }, [open, availableDates]);

  const changeMonth = (
    direction: number
  ) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);

      next.setDate(1);
      next.setMonth(
        next.getMonth() + direction
      );

      return next;
    });
  };

  const monthLabel =
    currentMonth.toLocaleDateString(
      "en-US",
      {
        month: "long",
        year: "numeric",
      }
    );

  const calendarDays = useMemo(() => {
    const year =
      currentMonth.getFullYear();

    const month =
      currentMonth.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    );

    const startDay =
      (firstDay.getDay() + 6) % 7;

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const prevMonthDays = new Date(
      year,
      month,
      0
    ).getDate();

    const cells: {
      day: number;
      currentMonth: boolean;
    }[] = [];

    for (
      let i = startDay - 1;
      i >= 0;
      i--
    ) {
      cells.push({
        day: prevMonthDays - i,
        currentMonth: false,
      });
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      cells.push({
        day,
        currentMonth: true,
      });
    }

    let nextDay = 1;

    while (cells.length < 42) {
      cells.push({
        day: nextDay++,
        currentMonth: false,
      });
    }

    return cells;
  }, [currentMonth]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="
        fixed
        inset-0
        z-[999]
        bg-black/35
        flex
        items-center
        justify-center
        p-4
      "
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Select Batch Date"
        onClick={(e) =>
          e.stopPropagation()
        }
        className="
          relative
          w-full
          max-w-[720px]
          bg-white
          rounded-[28px]
          shadow-[0_20px_60px_rgba(0,0,0,0.12)]
          overflow-visible
        "
      >
        <button
          aria-label="Close Calendar"
          onClick={onClose}
          className="
            absolute
            -top-12
            right-0
            z-50
            h-11
            w-11
            rounded-full
            bg-white
            shadow-lg
            flex
            items-center
            justify-center
            transition-colors
            hover:bg-gray-100
          "
        >
          <X size={18} />
        </button>

        <div
          className="
            px-6
            md:px-8
            py-5
            border-b
            border-[#F2F4F7]
          "
        >
          <div className="flex items-center justify-between">
            <h2
              className="
                text-[20px]
                md:text-[28px]
                font-bold
                tracking-tight
                text-[#101828]
                uppercase
              "
            >
              {monthLabel}
            </h2>

            <div className="flex gap-2">
              <button
                aria-label="Previous Month"
                onClick={() =>
                  changeMonth(-1)
                }
                className="
                  h-9
                  w-9
                  rounded-full
                  bg-black
                  text-white
                  flex
                  items-center
                  justify-center
                  transition-colors
                  hover:bg-[#111827]
                "
              >
                <ChevronLeft size={16} />
              </button>

              <button
                aria-label="Next Month"
                onClick={() =>
                  changeMonth(1)
                }
                className="
                  h-9
                  w-9
                  rounded-full
                  bg-black
                  text-white
                  flex
                  items-center
                  justify-center
                  transition-colors
                  hover:bg-[#111827]
                "
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div
          className="
            px-5
            sm:px-6
            md:px-8
            py-6
          "
        >
          <div className="grid grid-cols-7 mb-6">
            {[
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
              "Sun",
            ].map((day) => (
              <div
                key={day}
                className="
                  text-center
                  text-xs
                  sm:text-sm
                  md:text-base
                  font-medium
                  text-[#101828]
                "
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-5 md:gap-y-6">
            {calendarDays.map(
              (item, index) => {
                const date =
                  item.currentMonth
                    ? new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      item.day
                    )
                    : null;

                const dateKey = date
                  ? `${date.getFullYear()}-${String(
                    date.getMonth() + 1
                  ).padStart(2, "0")}-${String(
                    date.getDate()
                  ).padStart(2, "0")}`
                  : undefined;

                const hasBatch =
                  availableDateSet.size === 0
                    ? true
                    : !!(
                      dateKey &&
                      availableDateSet.has(
                        dateKey
                      )
                    );

                const isSelected =
                  date &&
                  selectedDate &&
                  date.toDateString() ===
                  selectedDate.toDateString();

                return (
                  <button
                    key={index}
                    disabled={
                      !item.currentMonth ||
                      !hasBatch
                    }
                    onClick={() => {
                      if (!date) return;

                      setSelectedDate(date);

                      const formattedDate =
                        date
                          .toISOString()
                          .split("T")[0];

                      onSelectDate(
                        formattedDate
                      );

                      onClose();
                    }}
                    className={`
                      mx-auto
                      flex
                      items-center
                      justify-center

                      h-8
                      w-8

                      sm:h-10
                      sm:w-10

                      md:h-11
                      md:w-11

                      rounded-full

                      text-sm
                      md:text-lg

                      font-bold

                      transition-colors

                      ${!hasBatch
                        ? "opacity-30 cursor-not-allowed"
                        : "cursor-pointer hover:bg-[#F3F4F6]"
                      }

                      ${isSelected
                        ? "bg-[#111827] text-white"
                        : "text-[#101828]"
                      }

                      ${!item.currentMonth
                        ? "text-gray-300"
                        : ""
                      }
                    `}
                  >
                    {item.day}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>
    </div>
  );
}