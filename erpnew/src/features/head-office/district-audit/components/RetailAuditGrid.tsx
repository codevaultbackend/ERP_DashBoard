"use client";

import RetailAuditCard from "./RetailAuditCard";
import RetailAuditEmpty from "./RetailAuditEmpty";
import {
  RetailAuditSkeletonGrid,
} from "./RetailAuditSkeleton";

import type {
  RetailAudit,
} from "../types/retail-audit.types";

type Props = {
  audits?: RetailAudit[];

  loading: boolean;

  downloadingId:
    | number
    | null;

  onDownload: (
    auditId: number
  ) => void;

  onView: (
    audit: RetailAudit
  ) => void;

  onClearFilters?: () => void;
};

export default function RetailAuditGrid({
  audits = [],
  loading,
  downloadingId,
  onDownload,
  onView,
  onClearFilters,
}: Props) {
  if (loading) {
    return (
      <RetailAuditSkeletonGrid />
    );
  }

  if (!audits.length) {
    return (
      <RetailAuditEmpty
        showReset
        onReset={onClearFilters}
      />
    );
  }

  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
        sm:gap-5
        lg:gap-6
        md:grid-cols-2
        2xl:grid-cols-3
      "
    >
      {audits.map(
        (audit) => (
          <RetailAuditCard
            key={audit.id}
            audit={audit}
            onView={onView}
          />
        )
      )}
    </div>
  );
}