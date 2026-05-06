"use client";

import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";

type GridItem = {
  id: string;
  name: string;
  code: string;
};

type Props =
  | {
      items: GridItem[];
      scope: "district";
      emptyText?: string;
    }
  | {
      items: GridItem[];
      scope: "store";
      districtId: string;
      emptyText?: string;
    };

export default function StoreCardGrid(props: Props) {
  const getHref = (itemId: string) => {
    if (props.scope === "district") {
      return `/head-office/store-management/${encodeURIComponent(itemId)}`;
    }

    return `/head-office/store-management/${encodeURIComponent(
      props.districtId
    )}/stores/${encodeURIComponent(itemId)}`;
  };

  if (props.items.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-[26px] border border-erp-border bg-erp-card text-[15px] font-semibold text-erp-muted shadow-erp-card">
        {props.emptyText || "No stores found."}
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {props.items.map((item) => (
        <Link
          key={item.id}
          href={getHref(item.id)}
          className="group flex min-h-[104px] items-center justify-between rounded-[24px] border border-erp-border bg-erp-card px-5 py-5 shadow-erp-card transition hover:-translate-y-[1px] hover:shadow-[0_8px_22px_rgba(15,23,42,0.09)] sm:min-h-[108px] sm:rounded-[26px] sm:px-6"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[18px] bg-[#EFF6FF]">
              <Store className="h-8 w-8 text-[#0667D8]" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-[18px] font-bold leading-tight tracking-[-0.02em] text-erp-text sm:text-[20px]">
                {item.name}
              </h3>

              <p className="mt-1 truncate text-[14px] font-medium text-erp-muted sm:text-[15px]">
                {item.code}
              </p>
            </div>
          </div>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-erp-card-soft transition group-hover:bg-[#EAF2FF]">
            <ArrowRight className="h-4 w-4 text-erp-text" />
          </span>
        </Link>
      ))}
    </div>
  );
}