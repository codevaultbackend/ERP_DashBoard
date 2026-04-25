import { ReactNode } from "react";

type SectionCardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

export default function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section
      className={[
        "rounded-[22px] border border-[#D9D9D9] bg-white shadow-[0px_2px_8px_rgba(15,23,42,0.04)] sm:rounded-[26px] lg:rounded-[32px]",
        className,
      ].join(" ")}
    >
      {(title || subtitle) && (
        <div className="px-4 pt-5 sm:px-5 sm:pt-6 lg:px-7">
          {title ? (
            <h3 className="text-[16px] font-semibold tracking-[-0.03em] text-[#111827] sm:text-[18px]">
              {title}
            </h3>
          ) : null}

          {subtitle ? (
            <p className="mt-1 text-[11px] leading-[15px] text-[#A3A3A3] sm:text-[12px] sm:leading-[16px]">
              {subtitle}
            </p>
          ) : null}
        </div>
      )}

      <div className={title || subtitle ? "px-3 pb-4 pt-4 sm:px-4 sm:pb-5 lg:px-5" : "p-4 sm:p-5 lg:p-6"}>
        {children}
      </div>
    </section>
  );
}