"use client";

import { X } from "lucide-react";
import LiveTransitMap from "./LiveTransitMap";



type Props = {
  open: boolean;
  transferId?: string | number | null;
  onClose: () => void;
};

export default function TransitMapModal({ open, transferId, onClose }: Props) {
  if (!open || !transferId) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm">
      <div className="relative h-[92vh] w-full max-w-[1180px] overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg transition hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <LiveTransitMap transferId={transferId} height="100%" />
      </div>
    </div>
  );
}