import { Gem, ShoppingCart } from "lucide-react";
import BillingSectionCard from "./BillingSectionCard";
import BillingItemsEmptyState from "./BillingItemsEmptyState";
import BillingItemRow from "./BillingItemRow";
import { formatWeight } from "../../utils/billing-utils";
import type { BillingCartItem } from "./BillingPageContent";

type Props = {
  items: BillingCartItem[];
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
    <BillingSectionCard className="min-h-[560px] overflow-hidden">
      <div className="flex min-h-[80px] flex-col gap-4 border-b border-[#E5E7EB] px-[22px] py-[18px] sm:flex-row sm:items-center sm:justify-between sm:px-[26px]">
        <div className="flex items-center gap-[10px]">
          <ShoppingCart className="h-[26px] w-[26px] text-[#A855F7]" />

          <h2 className="text-[22px] font-semibold leading-[26px] tracking-[-0.03em] text-[#111827]">
            Billing Items
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-[28px] text-[15px] font-medium text-[#667085]">
          <div className="flex items-center gap-[9px]">
            <span className="text-[24px] leading-none text-[#6B7280]">#</span>
            <span>Items:</span>
            <span className="font-semibold text-[#111827]">{totalItems}</span>
          </div>

          <div className="flex items-center gap-[9px]">
            <Gem className="h-[18px] w-[18px] text-[#D97706]" />
            <span>Weight:</span>
            <span className="font-semibold text-[#111827]">
              {formatWeight(totalWeight)}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white px-[22px] py-[24px] sm:px-[26px]">
        {items.length === 0 ? (
          <BillingItemsEmptyState onTryScan={onTryScan} />
        ) : (
          <div className="space-y-[18px]">
            {items.map((item) => (
              <BillingItemRow
                key={`${item.code}-${item.item_id || item.id}`}
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