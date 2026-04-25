"use client";

import Link from "next/link";
import { ChevronRight, Store } from "lucide-react";

type GridItem = {
  id: string;
  name: string;
  code: string;
};

type Props =
  | {
      items: GridItem[];
      scope: "district";
    }
  | {
      items: GridItem[];
      scope: "store";
      districtId: string;
    };

export default function StoreCardGrid(props: Props) {
  const getHref = (itemId: string) => {
    if (props.scope === "district") {
      return `/head-office/store-management/${itemId}`;
    }

    return `/head-office/store-management/${props.districtId}/stores/${itemId}`;
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      {props.items.map((item) => (
        <Link
          key={item.id}
          href={getHref(item.id)}
          className="rounded-[28px] border border-[#E5E7EB] bg-white p-5 shadow-[0px_4px_14px_rgba(15,23,42,0.035)] transition-transform duration-200 hover:-translate-y-[1px]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-[18px] bg-[#EEF4FF]">
                <Store className="h-8 w-8 text-[#1565D8]" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-[20px] font-semibold tracking-[-0.03em] text-[#111827]">
                  {item.name}
                </h3>
                <p className="mt-1 text-[16px] text-[#6B7280]">{item.code}</p>
              </div>
            </div>

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F4F4F5]">
              <ChevronRight className="h-5 w-5 text-[#111827]" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}