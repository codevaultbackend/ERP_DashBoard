export default function ReportsSkeleton() {
  return (
    <div className="w-full min-w-0 space-y-5 bg-erp-page pb-8 font-erp">
      <div>
        <div className="h-8 w-[260px] animate-pulse rounded-erp-sm bg-erp-border" />
        <div className="mt-3 h-4 w-[430px] max-w-full animate-pulse rounded-erp-sm bg-erp-border" />
      </div>

      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[122px] animate-pulse rounded-erp-xl bg-erp-card shadow-erp-card"
          />
        ))}
      </div>

      <div className="h-[486px] animate-pulse rounded-erp-xl bg-erp-card shadow-erp-card" />

      <div className="grid grid-cols-1 gap-[22px] xl:grid-cols-2">
        <div className="h-[390px] animate-pulse rounded-erp-xl bg-erp-card shadow-erp-card" />
        <div className="h-[390px] animate-pulse rounded-erp-xl bg-erp-card shadow-erp-card" />
      </div>

      <div className="h-[390px] animate-pulse rounded-erp-xl bg-erp-card shadow-erp-card" />
    </div>
  );
}