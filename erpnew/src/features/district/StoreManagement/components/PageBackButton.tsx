"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PageBackButton({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="inline-flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-[18px] border border-[#E2E8F0] bg-white text-[#334155] shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)] transition hover:bg-[#F8FAFC]"
    >
      <ArrowLeft className="h-6 w-6" />
    </Link>
  );
}