import { Search, ShoppingCart } from "lucide-react";

type Props = {
  onTryScan: () => void;
};

export default function BillingItemsEmptyState({ onTryScan }: Props) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center text-center ">
      <div className="flex h-[82px] w-[82px] items-center justify-center rounded-full bg-[#F3F4F6]">
        <ShoppingCart className="h-10 w-10 text-[#9CA3AF]" />
      </div>

      <h3 className="mt-6 text-[18px] font-semibold text-[#111827]">
        No items added yet
      </h3>

      <p className="mt-3 text-[16px] font-medium text-[#667085]">
        Scan or search products to start billing
      </p>

      <button
        type="button"
        onClick={onTryScan}
        className="mt-6 inline-flex h-[42px] items-center gap-2 rounded-[14px] border border-[#D9C2FF] bg-[#FCF7FF] px-5 text-[14px] font-medium text-[#7C3AED] transition hover:bg-[#F8F0FF]"
      >
        <Search className="h-4 w-4" />
        <span>Try scanning: GN001, SR002, GB003</span>
      </button>
    </div>
  );
}