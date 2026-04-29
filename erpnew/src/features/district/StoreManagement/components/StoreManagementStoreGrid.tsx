"use client";

import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import type { RetailStore } from "../types";

type Props = {
  stores: RetailStore[];
};

export default function StoreManagementStoreGrid({ stores }: Props) {
  if (!stores?.length) {
    return (
      <div className="rounded-erp-xl border border-dashed border-erp-border bg-erp-card p-10 text-center font-erp text-[15px] font-medium leading-[20px] tracking-[-0.02em] text-erp-muted shadow-erp-card">
        No retail stores found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-[18px] lg:grid-cols-2 2xl:grid-cols-3">
      {stores.map((store) => (
        <Link
          key={store.id}
          href={`/district/store-management/${store.id}`}
          className="group relative flex min-h-[108px] items-center rounded-erp-xl border border-erp-border bg-erp-card px-6 py-5 shadow-erp-card transition hover:-translate-y-[1px] hover:border-erp-primary/20 hover:shadow-md"
        >
          <div className="flex min-w-0 items-center gap-4 pr-10">
            <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-erp-sm bg-erp-blue-soft text-erp-primary">
              <Store className="h-7 w-7" strokeWidth={2.2} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-erp text-[20px] font-semibold leading-[25px] tracking-[-0.04em] text-erp-heading">
                {store.name || "Unnamed Store"}
              </h2>

              <p className="mt-1 truncate font-erp text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-erp-muted">
                {store.code || "—"}
              </p>
            </div>
          </div>

          <span className="absolute right-6 top-6 flex h-[26px] w-[26px] items-center justify-center rounded-[8px] bg-[#F5F5F5] text-erp-text transition group-hover:bg-erp-primary group-hover:text-white">
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </Link>
      ))}
    </div>
  );
}