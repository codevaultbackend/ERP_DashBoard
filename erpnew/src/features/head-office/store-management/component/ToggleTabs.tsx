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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ToggleTabs(props: Props) {
  const router = useRouter();

  const districtsHref = `/head-office/store-management/${encodeURIComponent(
    props.districtId
  )}`;

  const storesHref =
    props.scope === "district"
      ? `/head-office/store-management/${encodeURIComponent(
          props.districtId
        )}/stores`
      : `/head-office/store-management/${encodeURIComponent(
          props.districtId
        )}/stores/${encodeURIComponent(props.storeId)}`;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => router.push(districtsHref)}
        className={cn(
          "flex h-[42px] min-w-[124px] items-center justify-center rounded-erp-full px-6 text-[14px] font-semibold transition sm:h-[44px] sm:min-w-[132px] sm:px-7 sm:text-[15px]",
          props.active === "districts"
            ? "bg-erp-dark text-white"
            : "border border-erp-border bg-erp-card text-erp-text hover:bg-erp-card-soft"
        )}
      >
        Districts
      </button>

      <button
        type="button"
        onClick={() => router.push(storesHref)}
        className={cn(
          "flex h-[42px] min-w-[124px] items-center justify-center rounded-erp-full px-6 text-[14px] font-semibold transition sm:h-[44px] sm:min-w-[132px] sm:px-7 sm:text-[15px]",
          props.active === "stores"
            ? "bg-erp-dark text-white"
            : "border border-erp-border bg-erp-card text-erp-text hover:bg-erp-card-soft"
        )}
      >
        {props.scope === "district" ? "All Stores" : "Retail Stores"}
      </button>
    </div>
  );
}