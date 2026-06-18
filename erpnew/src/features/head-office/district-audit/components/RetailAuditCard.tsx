"use client";

import { useState } from "react";
import {
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";

import type {
  RetailAudit,
} from "../types/retail-audit.types";

type Props = {
  audit?: RetailAudit | null;
  onView?: (
    audit: RetailAudit
  ) => Promise<void> | void;
};

function formatDate(
  value?: string
) {
  if (!value) return "--";

  try {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return "--";
    }

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const year =
      date.getFullYear();

    return `${day}-${month}-${year}`;
  } catch {
    return "--";
  }
}

export default function RetailAuditCard({
  audit,
  onView,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  if (!audit) {
    console.warn(
      "RetailAuditCard received undefined audit"
    );

    return null;
  }

  const title =
    audit.store_name ||
    audit.audit_name ||
    audit.audit_title ||
    audit.audit_no ||
    `Report ${audit.id}`;

  const handleClick =
    async () => {
      if (loading) return;

      try {
        setLoading(true);

        if (
          typeof onView ===
          "function"
        ) {
          await onView(audit);
        }
      } catch (error) {
        console.error(
          "RetailAuditCard click failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-label={`View audit report ${title}`}
      className="
        w-full
        rounded-[28px]
        border
        border-[#E9EDF3]
        bg-white
        px-6
        py-5
        text-left
        transition-all
        duration-200
        hover:shadow-md
        disabled:cursor-not-allowed
        disabled:opacity-70
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className="
              flex
              h-14
              w-14
              shrink-0
              items-center
              justify-center
              rounded-[16px]
              bg-[#F5F8FF]
            "
          >
            <FileText
              className="
                h-7
                w-7
                text-[#2563EB]
              "
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <h3
              className="
                truncate
                text-[18px]
                font-semibold
                text-[#111827]
              "
            >
              {title}
            </h3>

            <p
              className="
                mt-1
                text-[14px]
                font-medium
                text-[#667085]
              "
            >
              {formatDate(
                audit.created_at
              )}
            </p>
          </div>
        </div>

        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#F5F5F5]
          "
        >
          {loading ? (
            <Loader2
              className="
                h-4
                w-4
                animate-spin
                text-[#2563EB]
              "
            />
          ) : (
            <ChevronRight
              className="
                h-4
                w-4
                text-[#111827]
              "
            />
          )}
        </div>
      </div>
    </button>
  );
}

