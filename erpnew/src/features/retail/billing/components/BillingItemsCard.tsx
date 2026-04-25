import { Gem, ShoppingCart } from "lucide-react";
import BillingSectionCard from "./BillingSectionCard";
import BillingItemsEmptyState from "./BillingItemsEmptyState";
import BillingItemRow from "./BillingItemRow";
import { formatWeight } from "../../../../features/retail/utils/billing-utils";

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
  totalItems: number;
  totalWeight: number;
  onTryScan: () => void;
  onIncrease: (code: string) => void;
  onDecrease: (code: string) => void;
  onRemove: (code: string) => void;
};

export default function BillingItemsCard({
  items,
  totalItems,
  totalWeight,
  onTryScan,
  onIncrease,
  onDecrease,
  onRemove,
}: Props) {
  return (
    <BillingSectionCard className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[#E7EBF0] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#FAF5FF]">
            <ShoppingCart className="h-6 w-6 text-[#7C3AED]" />
          </div>

          <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-[#111827]">
            Billing Items
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-[15px] font-medium text-[#667085]">
          <div className="flex items-center gap-2">
            <span className="text-[24px] leading-none text-[#98A2B3]">#</span>
            <span>Items:</span>
            <span className="font-semibold text-[#111827]">{totalItems}</span>
          </div>

          <div className="flex items-center gap-2">
            <Gem className="h-4.5 w-4.5 text-[#D97706]" />
            <span>Weight:</span>
            <span className="font-semibold text-[#111827]">
              {formatWeight(totalWeight)}
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-[430px] bg-white p-5 sm:p-6">
        {items.length === 0 ? (
          <BillingItemsEmptyState onTryScan={onTryScan} />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <BillingItemRow
                key={item.code}
                item={item}
                onIncrease={() => onIncrease(item.code)}
                onDecrease={() => onDecrease(item.code)}
                onRemove={() => onRemove(item.code)}
              />
            ))}
          </div>
        )}
      </div>
    </BillingSectionCard>
  );
}