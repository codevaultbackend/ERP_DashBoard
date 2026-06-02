"use client";

import {
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

interface Props {
  destination: any;
  expanded: boolean;
  onToggle: () => void;
  movementHistory?: any[];
}

export default function DestinationCard({
  destination,
  expanded,
  onToggle,
  movementHistory = [],
}: Props) {

  const timeline = useMemo(() => {
    return [...(movementHistory || [])].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
  }, [movementHistory]);

  const formatDate = (value?: string) => {
    if (!value) return "-";

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const quantity =
    destination?.quantity ?? 0;

  const storeName =
    destination?.store_name ||
    "Unknown Store";

  const level =
    destination?.organization_level ||
    "District Store";

  return (
    <div
      className={`
        bg-white
        rounded-[20px]
        border
        overflow-hidden
        transition-all
        duration-300
        hover:border-[#0000001A]
        ${expanded
          ? "border-[#0000001A] "
          : "border-[#0000001A]"
        }
      `}
    >
      <button
        onClick={onToggle}
        className="
          w-full
          text-left
          px-5
          py-5
        "
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3
                className="
                  text-[18px]
                  font-semibold
                  text-[#191B23]
                  leading-[24px]
                  tracking-[0%]
                
                "
              >
                {storeName}
              </h3>

              <span
                className="
                  shrink-0
                  rounded-full
                  bg-[#FEF3C7]
                  text-[#D97706]
                  px-2.5
                  py-0.5
                  text-[12px]
                  font-medium
                "
              >
                {quantity} units
              </span>
            </div>

            <div
              className="
                mt-2
                text-[14px]
                leading-[18px]
                text-[#515F74]
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <span>{level}</span>

              <span>•</span>

              <span>
                {formatDate(
                  destination?.last_updated_at
                )}
              </span>
            </div>
          </div>

          <div
            className="
              h-8
              w-8
              shrink-0
              rounded-lg
              bg-[#F9FAFB]
              flex
              items-center
              justify-center
            "
          >
            {expanded ? (
              <ChevronUp
                size={18}
                className="text-[#344054]"
              />
            ) : (
              <ChevronDown
                size={18}
                className="text-[#344054]"
              />
            )}
          </div>
        </div>
      </button>

      <div
        className={`
          overflow-hidden
          transition-all
          duration-300
          ${expanded
            ? "max-h-[1200px] opacity-100"
            : "max-h-0 opacity-0"
          }
        `}
      >
        <div
          className="
            px-5
            py-5
          "
        >
          <p
            className="
              text-[12px]
              leading-[16px]
              tracking-[0.6px]
              uppercase
              text-[#515F74]
              mb-4
            "
          >
            PROGRESS TIMELINE
          </p>

          {timeline.length === 0 ? (
            <div
              className="
                py-8
                text-center
                text-sm
                text-[#98A2B3]
              "
            >
              No movement history available
            </div>
          ) : (
            <div className="space-y-6">
              {timeline.map(
                (step, index) => (
                  <div
                    key={
                      step?.split_id ??
                      index
                    }
                    className="
                      flex
                      gap-3
                    "
                  >
                    <div className="relative">
                      <div
                        className="
                          h-3
                          w-3
                          rounded-full
                          bg-[#22C55E]
                        "
                      />

                      {index <
                        timeline.length - 1 && (
                          <div
                            className="
                            absolute
                            top-3
                            left-[5px]
                            h-[calc(100%+20px)]
                            border-l
                            border-dashed
                            border-[#D0D5DD]
                          "
                          />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className="
                          flex
                          flex-col
                          gap-1
                        "
                      >
                        <div
                          className="
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                            gap-1
                          "
                        >
                          <h4
                            className="
                              font-semibold
                              text-[#191B23]
                              text-[14px]
                              leading-[24px]
                              break-words
                            "
                          >
                            {step?.title ||
                              step?.type ||
                              "Movement Update"}
                          </h4>

                          <span
                            className="
                              text-[12px]
                              font-[400]
                              text-[#515F74]
                            "
                          >
                            {formatDate(
                              step?.created_at
                            )}
                          </span>
                        </div>

                        <p className="text-[12px] text-[#515F74] font-[400] break-words">

                          Successfully received at {step?.to_store_name || "-"}.

                        </p>
                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            mt-2
                          "
                        >
                          <div
                            className="
                              h-7
                              w-7
                              rounded-full
                              bg-[#F2F4F7]
                              flex
                              items-center
                              justify-center
                            "
                          >
                            <Image src={step.handled_by_img_url} alt="" height={24} width={24} className="rounded-full h-[24px] w-[24px]" priority />
                            <User
                              size={14}
                              className="
                                text-[#667085]
                              "
                            />
                          </div>

                          <span
                            className="
                              text-sm
                              font-medium
                              text-[#344054]
                            "
                          >
                            {step?.handled_by ? (
                              <span>
                                Handler:
                                {step.handled_by}
                              </span>
                            ) : (
                              <span>
                                Auto Processed
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}