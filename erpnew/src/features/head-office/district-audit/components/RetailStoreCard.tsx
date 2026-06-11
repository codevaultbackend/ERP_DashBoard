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

  const handleClick = () => {
    router.push(
      `/district/retail-audit/${store.id}`
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        group
        flex
        w-full
        items-center
        justify-between
        gap-3
        rounded-2xl
        border
        border-[#E5E7EB]
        bg-white
        p-4
        sm:p-5
        lg:p-6
        text-left
        shadow-sm
        transition-all
        duration-300
        hover:border-[#2563EB]
        hover:shadow-md
        hover:-translate-y-1
        active:scale-[0.98]
      "
    >
      {/* LEFT SIDE */}

      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div
          className="
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-[#EEF4FF]
            transition-all
            duration-300
            group-hover:bg-[#DBEAFE]
          "
        >
          <Building2
            className="
              h-6
              w-6
              text-[#2563EB]
            "
          />
        </div>

        <div className="min-w-0">
          <h3
            className="
              truncate
              text-sm
              font-semibold
              text-[#02011A]
              sm:text-base
              lg:text-lg
            "
          >
            {store.store_name}
          </h3>

          <p
            className="
              mt-1
              truncate
              text-xs
              text-[#64748B]
              sm:text-sm
            "
          >
            {store.store_code}
          </p>
        </div>
      </div>

      {/* RIGHT ARROW */}

      <div
        className="
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-[#F8FAFC]
          transition-all
          duration-300
          group-hover:bg-[#EEF4FF]
        "
      >
        <ChevronRight
          className="
            h-4
            w-4
            text-[#94A3B8]
            transition-transform
            duration-300
            group-hover:translate-x-1
          "
        />
      </div>
    </button>
  );
}