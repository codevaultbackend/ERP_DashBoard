"use client";

import { formatCurrency } from "./report-utils";

type Props = {
  active?: boolean;
  payload?: any[];
  label?: string;
};

export default function ReportChartTooltip({ active, payload, label }: Props) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-erp-sm border border-erp-border bg-erp-card px-3 py-2 shadow-erp-card">
      <p className="text-[12px] font-semibold leading-4 text-erp-heading">
        {label}
      </p>

      <div className="mt-1 space-y-1">
        {payload.map((item) => (
          <p
            key={`${item.dataKey}-${item.name}`}
            className="text-[12px] font-medium leading-4 text-erp-muted"
          >
            {item.name}:{" "}
            <span className="font-semibold text-erp-heading">
              {formatCurrency(item.value)}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}