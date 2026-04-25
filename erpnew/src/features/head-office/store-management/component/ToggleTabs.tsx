"use client";

import { useRouter } from "next/navigation";

type Props =
  | {
      scope: "district";
      districtId: string;
      active: "districts" | "stores";
    }
  | {
      scope: "store";
      districtId: string;
      storeId: string;
      active: "districts" | "stores";
    };

export default function ToggleTabs(props: Props) {
  const router = useRouter();

  const baseBtn =
    "min-w-[132px] rounded-full px-7 py-3 text-[15px] font-medium transition-all sm:px-8 sm:text-[16px]";

  const districtsHref = `/head-office/store-management/${props.districtId}`;
  const storesHref =
    props.scope === "district"
      ? `/head-office/store-management/${props.districtId}/stores`
      : `/head-office/store-management/${props.districtId}/stores/${props.storeId}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => router.push(districtsHref)}
        className={[
          baseBtn,
          props.active === "districts"
            ? "bg-[#020222] text-white"
            : "border border-[#E5E7EB] bg-white text-[#111827]",
        ].join(" ")}
      >
        Districts
      </button>

      <button
        type="button"
        onClick={() => router.push(storesHref)}
        className={[
          baseBtn,
          props.active === "stores"
            ? "bg-[#020222] text-white"
            : "border border-[#E5E7EB] bg-white text-[#111827]",
        ].join(" ")}
      >
        Retail Stores
      </button>
    </div>
  );
}