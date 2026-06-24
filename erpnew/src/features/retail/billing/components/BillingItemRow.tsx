import { Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/billing-utils";
import type { BillingCartItem } from "./BillingPageContent";

type Props = {
  item: BillingCartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function fixed(value: unknown, digits = 2) {
  return toNumber(value).toFixed(digits);
}

export default function BillingItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const grossWeight = toNumber(item.gross_weight, item.weight);
  const netWeight = toNumber(item.net_weight, item.weight);
  const rate = toNumber(item.rate);
  const makingPercent = toNumber(item.making_charge_percent);
  const makingValue = toNumber(item.makingCharges);
  const itemTotal = (toNumber(item.metalValue) + makingValue) * item.qty;

  return (
    <article className="rounded-[28px] border border-[#E5E7EB] bg-white px-[24px] pb-[18px] pt-[22px] shadow-[0px_2px_8px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-[22px] font-semibold leading-[27px] tracking-[-0.03em] text-[#171717]">
            {item.name}
          </h3>

          <p className="mt-[6px] break-all text-[13px] font-normal leading-[18px] text-[#6B7280]">
            {item.code}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[24px] font-semibold leading-[30px] tracking-[0.04em] text-[#171717]">
            {formatCurrency(itemTotal)}
          </p>

          <p className="mt-[3px] text-[12px] font-normal leading-[16px] text-[#6B7280]">
            Value (Incl. Making)
          </p>
        </div>
      </div>

      <div className="mt-[26px] grid grid-cols-2 gap-x-5 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
        <Spec label="Purity" value={item.purity || "-"} />
        <Spec label="Gross Wt" value={`${fixed(grossWeight)} g`} />
        <Spec label="Net Wt" value={`${fixed(netWeight)} g`} />
        <Spec label="Rate" value={fixed(rate)} />
        <Spec label="Making Charges" value={`${fixed(makingPercent, 0)}%`} />
        <Spec label="Making Value" value={fixed(makingValue)} />
      </div>

      <div className="mt-[20px] flex items-center justify-between border-t border-dashed border-[#D1D5DB] pt-[18px]">
        <button
          type="button"
          onClick={onRemove}
          className="flex h-[28px] w-[28px] items-center justify-center rounded-full text-[#6B7280] transition hover:bg-red-50 hover:text-red-600"
          aria-label="Remove item"
        >
          <Trash2 className="h-[17px] w-[17px]" />
        </button>
      </div>
    </article>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.12em] text-[#6B7280]">
        {label}
      </p>

      <p className="mt-[9px] truncate text-[15px] font-semibold leading-[19px] text-[#171717]">
        {value}
      </p>
    </div>
  );
}