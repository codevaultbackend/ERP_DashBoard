"use client";

import {
  ChevronRight,
  FileText,
} from "lucide-react";

import type {
  RetailAudit,
} from "@/features/head-office/district-audit/types/retail-audit.types";

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
        w-full
        overflow-hidden
        rounded-3xl
        border
        border-[#E8EAED]
        bg-white
        p-4
        sm:p-5
        lg:p-6
        text-left
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[#2563EB]
        hover:shadow-xl
        active:scale-[0.99]
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        {/* LEFT SECTION */}

        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div
            className="
              flex
              h-[56px]
              w-[56px]
              sm:h-[64px]
              sm:w-[64px]
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
                h-7
                w-7
                sm:h-8
                sm:w-8
                text-[#2563EB]
              "
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="
                mb-1
                text-[11px]
                sm:text-[12px]
                font-medium
                uppercase
                tracking-wider
                text-[#94A3B8]
              "
            >
              Audit Report
            </p>

            <h3
              className="
                break-words
                text-[16px]
                sm:text-[18px]
                lg:text-[20px]
                font-semibold
                leading-tight
                text-[#02011A]
              "
            >
              {title}
            </h3>

            <div
              className="
                mt-2
                flex
                flex-wrap
                items-center
                gap-x-3
                gap-y-1
              "
            >
              <span
                className="
                  text-[12px]
                  sm:text-[13px]
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
                  hidden
                  sm:block
                  h-1
                  w-1
                  rounded-full
                  bg-[#CBD5E1]
                "
              />

              <span
                className="
                  text-[12px]
                  sm:text-[13px]
                  font-medium
                  text-[#2563EB]
                "
              >
                Download Report
              </span>
            </div>

            <p
              className="
                mt-2
                break-all
                text-[11px]
                sm:text-[12px]
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
            self-end
            sm:self-center
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
              group-hover:translate-x-1
            "
          />
        </div>
      </div>
    </button>
  );
}