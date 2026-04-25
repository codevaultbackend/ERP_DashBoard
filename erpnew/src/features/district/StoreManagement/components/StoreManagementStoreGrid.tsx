"use client";

import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";
import { RetailStore } from "../types";

export default function StoreManagementStoreGrid({ stores }: { stores: RetailStore[] }) {
  if (!stores.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        No retail stores found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
      {stores.map((store) => (
        <Link
          key={store.id}
          href={`/district/store-management/${store.id}`}
          className="group flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-blue-600">
              <Store className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 md:text-xl">{store.name}</h2>
              <p className="text-sm text-slate-500">{store.code}</p>
              <p className="mt-1 text-xs text-slate-400">
                {store.active ? "Active" : "Inactive"} • {store.employeeCount} Employees • {store.revenue}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-2 text-slate-500 transition group-hover:bg-slate-100 group-hover:text-slate-900">
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      ))}
    </div>
  );
}