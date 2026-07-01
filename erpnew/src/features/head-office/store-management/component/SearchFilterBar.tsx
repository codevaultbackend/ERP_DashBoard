"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  search?: string;
  setSearch?: (value: string) => void;
  category?: string;
  setCategory?: (value: string) => void;
  categories?: string[];
  withCategory?: boolean;
  placeholder?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SearchFilterBar({
  search = "",
  setSearch,
  category = "Category",
  setCategory,
  categories = ["Category"],
  withCategory = false,
  placeholder = "Search inventory...",
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="rounded-[24px] border border-erp-border bg-erp-card p-3 shadow-erp-card sm:rounded-[30px] sm:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex h-[42px] flex-1 items-center rounded-erp-full bg-[#F4F4F5] px-4 sm:h-[44px]">
          <Search className="mr-3 h-5 w-5 shrink-0 text-[#8A94A6]" />

          <input
            value={search}
            onChange={(event) => setSearch?.(event.target.value)}
            placeholder={placeholder}
            className="h-full max-[768px]:h-[36px] w-full bg-transparent text-[14px] font-medium text-erp-text outline-none placeholder:text-erp-muted sm:text-[15px]"
          />
        </div>

        {withCategory ? (
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex h-[42px] w-full items-center justify-between rounded-erp-full bg-white px-5 text-[14px] font-semibold text-erp-text shadow-erp-sm transition hover:bg-erp-card-soft md:min-w-[160px] sm:h-[44px] sm:text-[15px]"
            >
              <span className="truncate">{category}</span>

              <ChevronDown
                className={cn(
                  "ml-3 h-4 w-4 shrink-0 transition",
                  open && "rotate-180"
                )}
              />
            </button>

            {open ? (
              <div className="absolute right-0 top-[50px] z-30 w-full min-w-[190px] overflow-hidden rounded-[18px] border border-erp-border bg-white p-2 shadow-erp-card">
                {categories.map((item) => {
                  const active = item === category;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCategory?.(item);
                        setOpen(false);
                      }}
                      className={cn(
                        "block w-full rounded-[12px] px-4 py-2.5 text-left text-[14px] font-semibold transition",
                        active
                          ? "bg-[#EEF5FF] text-[#0B63CE]"
                          : "text-erp-text hover:bg-erp-card-soft"
                      )}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}