import { Loader2 } from "lucide-react";

export default function LoadingState() {
  return (
    <div className="flex h-[500px] items-center justify-center rounded-[24px] border border-[#E8EAEE] bg-white">
      <div className="flex items-center gap-3 text-[15px] font-semibold text-[#667085]">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading reports...
      </div>
    </div>
  );
}