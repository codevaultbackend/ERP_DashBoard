"use client";

import { X } from "lucide-react";

type Props = {
  open: boolean;
  itemName?: string;
  remark: string;
  submitting?: boolean;
  onClose: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
};

export default function StockAuditPopup({
  open,
  itemName,
  remark,
  submitting = false,
  onClose,
  onChange,
  onSubmit,
}: Props) {
  if (!open) return null;

  const isValid = remark.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-[560px] rounded-[28px] border border-erp-border bg-erp-card p-6 shadow-[0px_24px_70px_rgba(15,23,42,0.20)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F4F5] text-[#111827] transition hover:bg-[#E5E7EB]"
        >
          <X size={19} strokeWidth={2.2} />
        </button>

        <div className="pr-10">
          <h2 className="text-[20px] font-semibold leading-[26px] tracking-[-0.03em] text-erp-heading">
            Stock Audit
          </h2>

          <p className="mt-1 text-[14px] font-medium leading-[18px] tracking-[-0.02em] text-erp-muted">
            Please enter reason for not done audit.
          </p>
        </div>

        <div className="mt-5 rounded-[20px] border border-erp-border bg-[#FCFCFD] p-4">
          <p className="mb-3 text-[14px] font-semibold leading-[18px] tracking-[-0.02em] text-[#111827]">
            {itemName || "Item"}
          </p>

          <textarea
            value={remark}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter reason"
            className={[
              "min-h-[118px] w-full resize-none rounded-[16px]",
              "border border-erp-border bg-white px-4 py-3",
              "text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-erp-text",
              "outline-none transition placeholder:text-erp-placeholder",
              "focus:border-erp-primary focus:ring-2 focus:ring-erp-primary/10",
            ].join(" ")}
          />

          {!isValid ? (
            <p className="mt-2 text-[12px] font-medium leading-[16px] tracking-[-0.02em] text-erp-danger">
              Reason is required.
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={[
              "flex h-[38px] items-center justify-center rounded-full",
              "border border-erp-border bg-white px-5",
              "text-[14px] font-semibold leading-[18px] tracking-[-0.02em] text-[#111827]",
              "transition hover:bg-[#F8FAFC]",
            ].join(" ")}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!isValid || submitting}
            className={[
              "flex h-[38px] min-w-[96px] items-center justify-center rounded-full px-5",
              "text-[14px] font-semibold leading-[18px] tracking-[-0.02em] transition",
              isValid && !submitting
                ? "bg-erp-success text-white shadow-[0px_6px_16px_rgba(22,184,51,0.22)] hover:brightness-[0.97]"
                : "cursor-not-allowed bg-[#D9DEE7] text-[#8E98A8]",
            ].join(" ")}
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}