"use client";

type Props = {
  points: string[];
};

export default function RefundPolicyCard({ points }: Props) {
  return (
    <div className="rounded-[32px] border border-[#077EF6] bg-[#F6FBFF] px-5 py-5 shadow-erp-sm sm:px-7 sm:py-6">
      <h2 className="text-[18px] font-semibold text-[#1C398E] max-[768px]:text-[20px]">
        Exchange Policy
      </h2>

      <ul className="mt-3 space-y-1.5 pl-5 text-[14px] font-[400] leading-[100%] text-[#1447E6] sm:text-[16px]">
        {points.map((point) => {
          const match = point.match(/(7 days|5% deduction charges|no deduction charges)/g);

          if (!match) {
            return <li key={point} className="!m-0">{point}</li>;
          }

          let rendered = point;
          match.forEach((m) => {
            rendered = rendered.replace(m, `__BOLD__${m}__BOLD__`);
          });

          const parts = rendered.split("__BOLD__");

          return (
            <li key={point}>
              {parts.map((part, index) =>
                match.includes(part) ? <strong key={index}>{part}</strong> : <span key={index}>{part}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}