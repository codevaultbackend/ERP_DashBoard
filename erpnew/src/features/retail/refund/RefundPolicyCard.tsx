"use client";

type Props = {
  points: string[];
};

export default function RefundPolicyCard({ points }: Props) {
  return (
    <div className="rounded-[28px] border border-[#3B82F6] bg-[#F6FBFF] px-5 py-5 shadow-[0px_2px_10px_rgba(15,23,42,0.02)] sm:px-7 sm:py-6">
      <h2 className="text-[18px] font-semibold text-[#1E3A8A] sm:text-[20px]">
        Refund Policy
      </h2>

      <ul className="mt-3 space-y-1.5 pl-5 text-[15px] leading-[1.55] text-[#2563EB] sm:text-[16px]">
        {points.map((point) => {
          const match = point.match(/(7 days|5% deduction charges|no deduction charges)/g);

          if (!match) {
            return <li key={point}>{point}</li>;
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