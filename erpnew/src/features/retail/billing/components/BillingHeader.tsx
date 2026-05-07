import { Wifi } from "lucide-react";

export default function BillingHeader() {
  return (
    <div className="mb-[24px] flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-[28px] font-semibold leading-[34px] tracking-[0.06em] text-[#111827] sm:text-[34px] sm:leading-[40px]">
          Active Sessions
        </h1>

        <p className="mt-[10px] text-[16px] font-normal leading-[22px] text-[#4B5563]">
          Scan or search products to create invoice
        </p>
      </div>

      <div className="flex justify-start lg:justify-end">
        <div className="inline-flex h-[40px] items-center gap-[10px] rounded-[10px] border border-[#A7F3D0] bg-[#ECFDF5] px-[18px] text-[14px] font-semibold text-[#047857]">
          <Wifi className="h-[20px] w-[20px]" />
          <span>Scanner Connected</span>
        </div>
      </div>
    </div>
  );
}