import { BadgeIndianRupee, FileText, X } from "lucide-react";
import BillingSectionCard from "./BillingSectionCard";
import {
  cn,
  formatCurrency,
  formatWeight,
} from "../../utils/billing-utils";

import type { BillingCartItem } from "./BillingPageContent";

type Props = {
  items: BillingCartItem[];
  metalValue: number;
  makingCharges: number;
  gst: number;
  grandTotal: number;
  totalItems: number;
  totalWeight: number;

  // ✅ FIXED
  onCreateBill?: () => void;

  onClearAll: () => void;
};

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[68px] items-center justify-between gap-4 border-b border-[#E5E7EB] text-[15px]">
      <span className="text-[#4B5563]">
        {label}
      </span>

      <span className="text-right text-[18px] font-semibold text-[#111827]">
        {value}
      </span>
    </div>
  );
}

export default function BillSummaryCard({
  items,
  metalValue,
  makingCharges,
  gst,
  grandTotal,
  totalItems,
  totalWeight,
  onCreateBill,
  onClearAll,
}: Props) {

  const handleCreateBill = () => {
    if (!items.length) {
      console.warn("No items added");
      return;
    }

    onCreateBill?.();
  };

  return (
    <BillingSectionCard className="h-fit overflow-hidden xl:sticky xl:top-5">
      <div className="flex min-h-[80px] items-center gap-[12px] border-b border-[#E5E7EB] px-[26px] py-[20px]">
        <BadgeIndianRupee className="h-[26px] w-[26px] text-[#A855F7]" />

        <h2 className="text-[22px] font-semibold leading-[26px] tracking-[-0.03em] text-[#111827]">
          Bill Summary
        </h2>
      </div>

      <div className="px-[26px] pb-[25px] pt-[4px]">
        <SummaryRow
          label="Metal Value"
          value={formatCurrency(metalValue)}
        />

        <SummaryRow
          label="Making Charges"
          value={formatCurrency(makingCharges)}
        />

        <SummaryRow
          label="GST (3%)"
          value={formatCurrency(gst)}
        />

        <div className="mx-[-26px] mt-[18px] bg-[#F4F7FC] px-[26px] py-[20px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[18px] font-semibold text-[#111827]">
              Grand Total
            </span>

            <span className="text-[30px] font-bold leading-[36px] tracking-[-0.04em] text-[#111827]">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateBill}
          disabled={items.length === 0}
          className={cn(
            "mt-[34px] inline-flex h-[60px] w-full items-center justify-center gap-[14px] rounded-full text-[19px] font-semibold text-white shadow-[0px_12px_26px_rgba(17,24,39,0.18)] transition",
            items.length === 0
              ? "cursor-not-allowed bg-black/45"
              : "bg-black hover:translate-y-[-1px]"
          )}
        >
          <span className="flex h-[28px] w-[28px] items-center justify-center rounded-full border border-white/25">
            <FileText className="h-[16px] w-[16px]" />
          </span>

          <span>Create Bill</span>
        </button>

        <div className="mt-[20px] border-t border-[#E5E7EB] pt-[18px]">
          <div className="grid grid-cols-2 gap-[12px]">
            <div className="rounded-[8px] bg-[#EFF6FF] px-[14px] py-[15px]">
              <p className="text-[14px] font-medium text-[#2563EB]">
                Total Items
              </p>

              <p className="mt-[9px] text-[28px] font-bold leading-[32px] text-[#2563EB]">
                {totalItems}
              </p>
            </div>

            <div className="rounded-[8px] bg-[#FEFCE8] px-[14px] py-[15px]">
              <p className="text-[14px] font-medium text-[#A16207]">
                Total Weight
              </p>

              <p className="mt-[9px] text-[28px] font-bold leading-[32px] text-[#A16207]">
                {formatWeight(totalWeight)}
              </p>
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <div className="mt-[18px] rounded-[18px] border border-[#E5E7EB] bg-[#FAFBFC] p-[14px]">
            <div className="mb-[12px] flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#111827]">
                Added Items
              </h3>

              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[#DC2626]"
              >
                <X className="h-[14px] w-[14px]" />

                Clear all
              </button>
            </div>

            <div className="max-h-[260px] space-y-[8px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.code}-${item.item_id || item.id}`}
                  className="flex items-center justify-between gap-3 rounded-[12px] bg-white px-[12px] py-[11px]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#111827]">
                      {item.name}
                    </p>

                    <p className="mt-[2px] truncate text-[12px] font-medium text-[#667085]">
                      {item.code} × {item.qty}
                    </p>
                  </div>

                  <p className="shrink-0 text-[14px] font-semibold text-[#111827]">
                    {formatCurrency(
                      (item.metalValue +
                        item.makingCharges) *
                      item.qty
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </BillingSectionCard>
  );
}