"use client";

import { FileSearch, RefreshCw } from "lucide-react";

type Props = {
  title?: string;

  description?: string;

  showReset?: boolean;

  onReset?: () => void;
};

export default function RetailAuditEmpty({
  title = "No Audit Reports Found",

  description = "There are no audit reports matching the selected filters.",

  showReset = false,

  onReset,
}: Props) {
  return (
    <div
      className="
        flex
        min-h-[420px]
        flex-col
        items-center
        justify-center
        rounded-[32px]
        border
        border-dashed
        border-[#E5E7EB]
        bg-white
        px-6
        text-center
      "
    >
      {/* Icon */}

      <div
        className="
          flex
          h-[90px]
          w-[90px]
          items-center
          justify-center
          rounded-[28px]
          bg-[#EEF4FF]
        "
      >
        <FileSearch
          className="
            h-10
            w-10
            text-[#2563EB]
          "
        />
      </div>

      {/* Title */}

      <h2
        className="
          mt-6
          text-[24px]
          font-bold
          tracking-[-0.03em]
          text-[#02011A]
        "
      >
        {title}
      </h2>

      {/* Description */}

      <p
        className="
          mt-3
          max-w-[500px]
          text-[15px]
          leading-7
          text-[#64748B]
        "
      >
        {description}
      </p>

      {/* Reset */}

      {showReset && (
        <button
          onClick={onReset}
          className="
            mt-6
            inline-flex
            h-[52px]
            items-center
            gap-2
            rounded-[18px]
            border
            border-[#E5E7EB]
            bg-white
            px-5
            text-sm
            font-semibold
            text-[#02011A]
            shadow-sm
            transition-all
            hover:bg-[#F8FAFC]
          "
        >
          <RefreshCw
            className="
              h-4
              w-4
            "
          />

          Clear Filters
        </button>
      )}
    </div>
  );
}