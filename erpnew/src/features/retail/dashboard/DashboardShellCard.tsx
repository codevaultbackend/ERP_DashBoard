"use client";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

export default function DashboardShellCard({
  title,
  subtitle,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
}: Props) {
  return (
    <section
      className={`
        overflow-hidden rounded-[28px] bg-white
        shadow-[1px_1px_4px_0px_#0000001A] h-[337px] overflow-y-auto
        ${className}
      `}
    >
      <div className={`px-[30px] pt-[28px] ${headerClassName}`}>
        <h3 className="text-[20px] font-semibold leading-[24px] tracking-[-0.02em] text-[#111827]">
          {title}
        </h3>

        {subtitle ? (
          <p className="mt-[3px] text-[13px] font-normal leading-[18px] text-[#8B8B8B]">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className={`px-[30px] ${bodyClassName}`}>{children}</div>
    </section>
  );
}