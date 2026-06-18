"use client";

import {
  ChevronRight,
  FileText,
} from "lucide-react";

import type {
  RetailAudit,
} from "../types/retail-audit.types";

type Props = {
  audit: RetailAudit;

  onView?: (
    audit: RetailAudit
  ) => Promise<void> | void;
};

function formatDate(
  value?: string
) {
  if (!value) return "--";

  try {
    return new Date(
      value
    ).toLocaleDateString(
      "en-GB"
    );
  } catch {
    return "--";
  }
}

export default function RetailAuditCard({
  audit,
  onView,
}: Props) {
  const title =
    audit.audit_name ||
    audit.audit_title ||
    audit.audit_no ||
    `Report ${audit.id}`;

  const auditId =
    audit.audit_no ||
    `AUD-${audit.id}`;

  const handleClick = async () => {
    try {
      if (
        typeof onView === "function"
      ) {
        await onView(audit);
      }
    } catch (error) {
      console.error(
        "RetailAuditCard click failed:",
        error
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Download audit report ${title}`}
      className="
        group
        relative
        flex
        w-full
        cursor-pointer
        items-center
        justify-between
        rounded-[28px]
        border
        border-[#E8EAED]
        bg-white
        px-6
        py-5
        text-left
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        active:scale-[0.99]
      "
    >
      {/* LEFT SECTION */}

      <div className="flex min-w-0 items-center gap-4">
        <div
          className="
            flex
            h-[64px]
            w-[64px]
            shrink-0
            items-center
            justify-center
            rounded-[18px]
            border
            border-[#DBEAFE]
            bg-[#EEF4FF]
            transition-all
            duration-300
            group-hover:scale-105
            group-hover:bg-[#DBEAFE]
          "
        >
          <FileText
            className="
              h-8
              w-8
              text-[#2563EB]
            "
          />
        </div>

        <div className="min-w-0">
          <p
            className="
              mb-1
              text-[12px]
              font-medium
              uppercase
              tracking-wide
              text-[#94A3B8]
            "
          >
            Audit Report
          </p>

          <h3
            className="
              truncate
              text-[20px]
              font-semibold
              leading-tight
              text-[#02011A]
            "
          >
            {title}
          </h3>

          <div className="mt-2 flex items-center gap-3">
            <span
              className="
                text-[13px]
                font-medium
                text-[#64748B]
              "
            >
              {formatDate(
                audit.created_at
              )}
            </span>

            <span
              className="
                h-1
                w-1
                rounded-full
                bg-[#CBD5E1]
              "
            />

            <span
              className="
                text-[13px]
                font-medium
                text-[#2563EB]
              "
            >
              Download Report
            </span>
          </div>

          <p
            className="
              mt-1
              text-[12px]
              text-[#94A3B8]
            "
          >
            {auditId}
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#F4F4F5]
          transition-all
          duration-300
          group-hover:bg-[#EEF4FF]
          group-hover:shadow-sm
        "
      >
        <ChevronRight
          className="
            h-[18px]
            w-[18px]
            text-[#111827]
            transition-transform
            duration-300
            group-hover:translate-x-0.5
          "
        />
      </div>
    </button>
  );
}