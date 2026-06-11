"use client";

import { Building2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  store: {
    id: number;
    store_name: string;
    store_code: string;
  };
};

export default function RetailStoreCard({
  store,
}: Props) {
  const router = useRouter();

  return (
    <button
      onClick={() =>
        router.push(
          `/district/retail-audit/${store.id}`
        )
      }
      className="
        group
        flex
        items-center
        justify-between
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        p-6
        shadow-sm
        transition-all
        hover:-translate-y-1
        hover:shadow-md
      "
    >
      <div className="flex items-center gap-4">
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-[18px]
            bg-[#EEF4FF]
          "
        >
          <Building2
            className="
              h-7
              w-7
              text-[#2563EB]
            "
          />
        </div>

        <div className="text-left">
          <h3
            className="
              text-lg
              font-semibold
              text-[#02011A]
            "
          >
            {store.store_name}
          </h3>

          <p
            className="
              text-sm
              text-[#64748B]
            "
          >
            {store.store_code}
          </p>
        </div>
      </div>

      <ChevronRight
        className="
          h-5
          w-5
          text-[#94A3B8]
        "
      />
    </button>
  );
}