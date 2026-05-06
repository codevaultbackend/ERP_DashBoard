"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  subtitle?: string;
};

export default function BackTitleRow({ title, subtitle }: Props) {
  const router = useRouter();

  return (
    <div className="mb-5 flex items-start gap-4 sm:items-center">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[16px] border border-erp-border bg-erp-card text-erp-text shadow-erp-card transition hover:bg-erp-card-soft sm:h-[54px] sm:w-[54px] sm:rounded-[18px]"
      >
        <ChevronLeft className="h-7 w-7" />
      </button>

      <div className="min-w-0">
        <h1 className="truncate text-[28px] font-bold leading-tight tracking-[-0.04em] text-erp-text sm:text-[36px]">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-1 truncate text-[15px] font-medium text-erp-muted sm:text-[17px]">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}