"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
};

export default function BackTitleRow({ title }: Props) {
  const router = useRouter();

  return (
    <div className="mb-5 flex items-center gap-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-[54px] w-[54px] items-center justify-center rounded-[18px] border border-[#E5E7EB] bg-white text-[#111827] shadow-[0px_4px_14px_rgba(15,23,42,0.04)]"
      >
        <ChevronLeft className="h-7 w-7" />
      </button>

      <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[40px]">
        {title}
      </h1>
    </div>
  );
}