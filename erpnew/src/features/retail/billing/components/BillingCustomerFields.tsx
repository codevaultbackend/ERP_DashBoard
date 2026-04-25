type Props = {
  customerName: string;
  customerPhone: string;
  setCustomerName: (value: string) => void;
  setCustomerPhone: (value: string) => void;
};

export default function BillingCustomerFields({
  customerName,
  customerPhone,
  setCustomerName,
  setCustomerPhone,
}: Props) {
  return (
    <div className="grid grid-cols-1 !gap-4 lg:grid-cols-2 my-[24px] ">
      <input
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        placeholder="Customer Name (Optional)"
        className="h-[44px] placeholder:text-[#717182] rounded-[8px] border border-[#EEF1F4] bg-[#F3F3F5] px-4 text-[14px] font-[400] text-[#111827] outline-none placeholder:text-[#98A2B3] focus:border-[#D7DBE2] focus:ring-2 focus:ring-[#EEF2FF]"
      />
      <input
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        placeholder="Customer Phone (Optional)"
        className="h-[44px] rounded-[8px] border placeholder:text-[#717182] border-[#EEF1F4] bg-[#F3F3F5] px-4 text-[14px] font-[400] text-[#111827] outline-none placeholder:text-[#98A2B3] focus:border-[#D7DBE2] focus:ring-2 focus:ring-[#EEF2FF]"
      />
    </div>
  );
}