"use client";

import { X } from "lucide-react";
import type { AuditStatus } from "../api/audit-api";

type Props = {
  open: boolean;
  selectedCount: number;
  auditStatus: AuditStatus;
  remark: string;
  submitting: boolean;
  onClose: () => void;
  onStatusChange: (value: AuditStatus) => void;
  onRemarkChange: (value: string) => void;
  onSubmit: () => void;
};

export default function StockAuditPopup({
  open,
  selectedCount,
  auditStatus,
  remark,
  submitting,
  onClose,
  onStatusChange,
  onRemarkChange,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-[430px] rounded-[24px] bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#111827] transition hover:bg-[#E5E7EB]"
        >
          <X size={18} />
        </button>

        <h2 className="text-[20px] font-semibold text-black">
          Submit Stock Audit
        </h2>

        <p className="mt-2 text-[14px] text-[#6B7280]">
          You selected {selectedCount} item(s). Submit audit to mark checklist as completed.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">
              Audit Result
            </label>

            <select
              value={auditStatus}
              onChange={(e) => onStatusChange(e.target.value as AuditStatus)}
              className="h-[44px] w-full rounded-[12px] border border-[#D1D5DB] bg-white px-3 text-[14px] text-[#111827] outline-none"
            >
              <option value="present">Present</option>
              <option value="missing">Missing</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[14px] font-medium text-[#111827]">
              Remark
            </label>

            <textarea
              value={remark}
              onChange={(e) => onRemarkChange(e.target.value)}
              placeholder="Enter audit remark"
              className="min-h-[96px] w-full resize-none rounded-[12px] border border-[#D1D5DB] p-3 text-[14px] text-[#111827] outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-[12px] border border-[#D1D5DB] px-5 py-2.5 text-[14px] font-medium text-[#111827] disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-[12px] bg-[#22C55E] px-5 py-2.5 text-[14px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit Audit"}
          </button>
        </div>
      </div>
    </div>
  );
}