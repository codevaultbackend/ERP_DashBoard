import { BadgeIndianRupee, FileText, X } from "lucide-react";
import BillingSectionCard from "./BillingSectionCard";
import { cn, formatCurrency, formatWeight } from "../../../../features/retail/utils/billing-utils";

type CartItem = {
  id: number;
  code: string;
  name: string;
  metalValue: number;
  makingCharges: number;
  weight: number;
  qty: number;
};

type Props = {
  items: CartItem[];
  metalValue: number;
  makingCharges: number;
  gst: number;
  grandTotal: number;
  totalItems: number;
  totalWeight: number;
  onCreateBill: () => void;
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
    <div className="flex items-center justify-between gap-4 border-b border-[#E8ECF2] py-5 text-[15px]">
      <span className="text-[#4B5563]">{label}</span>
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
  return (
    <BillingSectionCard className="h-fit overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[#E7EBF0] px-5 py-6 sm:px-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#FAF5FF]">
          <BadgeIndianRupee className="h-6 w-6 text-[#9333EA]" />
        </div>

        <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[#111827]">
          Bill Summary
        </h2>
      </div>

      <div className="px-5 pb-5 pt-2 sm:px-6 sm:pb-6">
        <SummaryRow label="Metal Value" value={formatCurrency(metalValue)} />
        <SummaryRow
          label="Making Charges"
          value={formatCurrency(makingCharges)}
        />
        <SummaryRow label="GST (3%)" value={formatCurrency(gst)} />

        <div className="mt-4 rounded-[16px] bg-[#F4F6FB] px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[18px] font-semibold text-[#111827]">
              Grand Total
            </span>
            <span className="text-[28px] font-bold tracking-[-0.03em] text-[#111827]">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCreateBill}
          disabled={items.length === 0}
          className={cn(
            "mt-7 inline-flex h-[58px] w-full items-center justify-center gap-3 rounded-full text-[18px] font-semibold text-white shadow-[0px_10px_24px_rgba(17,24,39,0.18)] transition",
            items.length === 0
              ? "cursor-not-allowed bg-[#111827]/45"
              : "bg-black hover:translate-y-[-1px]"
          )}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25">
            <FileText className="h-4 w-4" />
          </span>
          <span>Create Bill</span>
        </button>

        <div className="mt-6 border-t border-[#E8ECF2] pt-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[14px] bg-[#EEF4FF] px-4 py-4">
              <p className="text-[14px] font-medium text-[#2563EB]">
                Total Items
              </p>
              <p className="mt-2 text-[18px] font-bold text-[#1D4ED8]">
                {totalItems}
              </p>
            </div>

            <div className="rounded-[14px] bg-[#F8F2DF] px-4 py-4">
              <p className="text-[14px] font-medium text-[#D97706]">
                Total Weight
              </p>
              <p className="mt-2 text-[18px] font-bold text-[#A16207]">
                {formatWeight(totalWeight)}
              </p>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-5 rounded-[18px] border border-[#E9EDF3] bg-[#FAFBFC] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#111827]">
                Added Items
              </h3>

              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-[#DC2626]"
              >
                <X className="h-3.5 w-3.5" />
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between gap-3 rounded-[12px] bg-white px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-[#111827]">
                      {item.name}
                    </p>
                    <p className="text-[12px] font-medium text-[#667085]">
                      {item.code} × {item.qty}
                    </p>
                  </div>

                  <p className="shrink-0 text-[14px] font-semibold text-[#111827]">
                    {formatCurrency(
                      (item.metalValue + item.makingCharges) * item.qty
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BillingSectionCard>
  );
}