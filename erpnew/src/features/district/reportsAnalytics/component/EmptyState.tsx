type EmptyStateProps = {
  label: string;
  heightClass?: string;
};

export default function EmptyState({
  label,
  heightClass = "h-[260px]",
}: EmptyStateProps) {
  return (
    <div
      className={`${heightClass} flex items-center justify-center rounded-[18px] border border-dashed border-[#D9DEE7] bg-[#FAFBFC]`}
    >
      <p className="text-center text-[14px] font-medium text-[#667085]">
        {label}
      </p>
    </div>
  );
}