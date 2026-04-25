"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { TransitTransfer } from "./types";
import TransitGoogleMap from "./TransitGoogleMap";

export default function TransitMapModal({
  item,
  open,
  onClose,
}: {
  item: TransitTransfer | null;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="flex h-full w-full items-center justify-center p-3 sm:p-4 md:p-6">
        <div
          className="relative w-full max-w-[1080px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close map"
            className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0px_10px_30px_rgba(16,24,40,0.18)] transition-transform hover:scale-[1.02] sm:h-12 sm:w-12 md:right-4 md:top-4"
          >
            <X className="h-5 w-5 text-[#111827] sm:h-6 sm:w-6" />
          </button>

          <div className="overflow-hidden rounded-[22px] bg-white shadow-[0px_24px_60px_rgba(16,24,40,0.18)] sm:rounded-[28px] md:rounded-[32px]">
            <TransitGoogleMap
              item={item}
              large
              height={typeof window !== "undefined" && window.innerWidth < 640 ? 78 * 8 : 770}
            />
          </div>
        </div>
      </div>
    </div>
  );
}