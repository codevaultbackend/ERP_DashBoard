"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  href: string;
};

export default function PageBackButton({ href }: Props) {
  return (
    <Link
      href={href}
      aria-label="Go back"
      className="inline-flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-erp-sm border border-erp-border bg-erp-card text-erp-text-soft shadow-erp-card transition hover:-translate-y-[1px] hover:bg-erp-primary-soft hover:text-erp-primary"
    >
      <ArrowLeft className="h-5 w-5" strokeWidth={2.2} />
    </Link>
  );
}