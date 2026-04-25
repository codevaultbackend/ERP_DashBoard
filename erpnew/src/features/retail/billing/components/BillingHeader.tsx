import { FileText, Wifi } from "lucide-react";

export default function BillingHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-[30px] font-semibold leading-[36px] tracking-[-0.04em] text-[#101828] sm:text-[40px]">
          Active Sessions
        </h1>
        <p className="mt-3 text-[15px] font-[400] text-[#4A5565]">
          Scan or search products to create invoice
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex h-[48px] items-center gap-3 rounded-[14px] border border-[#B7E6C0] bg-[#EBFFF0] px-5 text-[15px] font-semibold text-[#169C47] shadow-[0px_1px_0px_rgba(255,255,255,0.6)_inset]">
          <Wifi className="h-5 w-5" />
          <span>Scanner Connected</span>
        </div>
      </div>
    </div>
  );
}