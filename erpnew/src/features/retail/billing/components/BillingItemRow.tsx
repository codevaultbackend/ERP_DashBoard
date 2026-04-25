import { Trash2 } from "lucide-react";
import { formatCurrency, formatWeight } from "../../../../features/retail/utils/billing-utils";

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
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export default function BillingItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  const itemTotal = (item.metalValue + item.makingCharges) * item.qty;

  return (
    <div className="rounded-[24px] border border-[#E7ECF2] bg-[#FBFCFD] p-4 shadow-[0px_2px_10px_rgba(15,23,42,0.03)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[17px] font-semibold text-[#111827]">
              {item.name}
            </h3>
            <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[12px] font-semibold text-[#4F46E5]">
              {item.code}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] font-medium text-[#667085]">
            <span>Metal: {formatCurrency(item.metalValue)}</span>
            <span>Making: {formatCurrency(item.makingCharges)}</span>
            <span>Weight: {formatWeight(item.weight)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-[42px] items-center rounded-full border border-[#E4E7EC] bg-white px-2 shadow-sm">
            <button
              type="button"
              onClick={onDecrease}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[18px] font-semibold text-[#111827] transition hover:bg-[#F3F4F6]"
            >
              -
            </button>

            <span className="min-w-[28px] text-center text-[15px] font-semibold text-[#111827]">
              {item.qty}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[18px] font-semibold text-[#111827] transition hover:bg-[#F3F4F6]"
            >
              +
            </button>
          </div>

          <div className="min-w-[110px] text-right">
            <p className="text-[18px] font-semibold text-[#111827]">
              {formatCurrency(itemTotal)}
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F1D4D4] bg-[#FFF5F5] text-[#DC2626] transition hover:bg-[#FEECEC]"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}