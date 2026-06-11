"use client";

import {
  FileSearch,
  RefreshCw,
} from "lucide-react";

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
        min-h-[320px]
        sm:min-h-[420px]
        flex-col
        items-center
        justify-center
        rounded-2xl
        sm:rounded-[32px]
        border
        border-dashed
        border-[#E5E7EB]
        bg-white
        px-4
        py-10
        sm:px-6
        text-center
      "
    >
      {/* Icon */}

      <div
        className="
          flex
          h-[72px]
          w-[72px]
          sm:h-[90px]
          sm:w-[90px]
          items-center
          justify-center
          rounded-2xl
          sm:rounded-[28px]
          bg-[#EEF4FF]
        "
      >
        <FileSearch
          className="
            h-8
            w-8
            sm:h-10
            sm:w-10
            text-[#2563EB]
          "
        />
      </div>

      {/* Title */}

      <h2
        className="
          mt-5
          sm:mt-6
          text-[20px]
          sm:text-[24px]
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
          px-2
          text-[14px]
          sm:text-[15px]
          leading-6
          sm:leading-7
          text-[#64748B]
        "
      >
        {description}
      </p>

      {/* Reset Button */}

      {showReset && (
        <button
          onClick={onReset}
          className="
            mt-6
            inline-flex
            min-h-[48px]
            sm:h-[52px]
            items-center
            justify-center
            gap-2
            rounded-xl
            sm:rounded-[18px]
            border
            border-[#E5E7EB]
            bg-white
            px-4
            sm:px-5
            text-sm
            font-semibold
            text-[#02011A]
            shadow-sm
            transition-all
            hover:bg-[#F8FAFC]
            active:scale-[0.98]
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