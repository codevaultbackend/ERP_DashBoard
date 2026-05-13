"use client";

export default function ReportsSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <div className="h-8 w-[260px] animate-pulse rounded-erp-xs bg-erp-border" />
        <div className="mt-3 h-4 w-[440px] max-w-full animate-pulse rounded-erp-xs bg-erp-border" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-[90px] animate-pulse rounded-erp-md bg-erp-card shadow-erp-card"
          />
        ))}
      </div>

      <div className="h-[430px] animate-pulse rounded-erp-xl bg-erp-card shadow-erp-card" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="h-[390px] animate-pulse rounded-erp-xl bg-erp-card shadow-erp-card" />
        <div className="h-[390px] animate-pulse rounded-erp-xl bg-erp-card shadow-erp-card" />
      </div>

      <div className="h-[390px] animate-pulse rounded-erp-xl bg-erp-card shadow-erp-card" />
    </div>
  );
}