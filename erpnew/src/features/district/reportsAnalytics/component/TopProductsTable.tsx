import { ArrowUpRight, Trophy } from "lucide-react";
import type { DistrictReportsData } from "../types";
import { cn, formatCurrency, getRankColor } from "../utils";

type TopProductsTableProps = {
  data: DistrictReportsData["topProducts"];
};

export default function TopProductsTable({ data }: TopProductsTableProps) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#E8EAEE] bg-white shadow-[0_8px_24px_rgba(16,24,40,0.035)]">
      <div className="border-b border-[#EEF0F3] bg-[#FBFAFF] px-[22px] py-[18px]">
        <div className="flex items-center gap-2">
          <Trophy className="h-[20px] w-[20px] text-[#6D5DF6]" />

          <h2 className="text-[18px] font-bold leading-[24px] tracking-[-0.03em] text-[#111827]">
            Top Performing Products
          </h2>
        </div>

        <p className="mt-[4px] text-[13px] font-normal leading-[18px] text-[#667085]">
          Best-selling items by revenue and quantity
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#FCFCFD]">
              <th className="px-[22px] py-[15px] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                Rank
              </th>
              <th className="px-[22px] py-[15px] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                Product Name
              </th>
              <th className="px-[22px] py-[15px] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                Category
              </th>
              <th className="px-[22px] py-[15px] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                Units Sold
              </th>
              <th className="px-[22px] py-[15px] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                Total Revenue
              </th>
              <th className="px-[22px] py-[15px] text-left text-[11px] font-bold uppercase tracking-[0.08em] text-[#667085]">
                Performance
              </th>
            </tr>
          </thead>

          <tbody>
            {data.length ? (
              data.map((product) => (
                <tr
                  key={`${product.rank}-${product.product_name}`}
                  className="border-b border-[#EEF0F3] last:border-b-0"
                >
                  <td className="px-[22px] py-[18px]">
                    <span
                      className={cn(
                        "inline-flex h-[34px] w-[34px] items-center justify-center rounded-full text-[13px] font-bold",
                        getRankColor(product.rank)
                      )}
                    >
                      #{product.rank}
                    </span>
                  </td>

                  <td className="max-w-[320px] px-[22px] py-[18px]">
                    <p className="truncate text-[14px] font-bold leading-[20px] text-[#111827]">
                      {product.product_name}
                    </p>
                  </td>

                  <td className="px-[22px] py-[18px]">
                    <span className="inline-flex rounded-full bg-[#F4E8FF] px-3 py-1 text-[12px] font-bold text-[#8B5CF6]">
                      {product.category}
                    </span>
                  </td>

                  <td className="px-[22px] py-[18px] text-[14px] font-bold text-[#344054]">
                    {product.units_sold}
                  </td>

                  <td className="px-[22px] py-[18px] text-[14px] font-bold text-[#039855]">
                    {formatCurrency(product.total_revenue)}
                  </td>

                  <td className="px-[22px] py-[18px]">
                    <div className="flex items-center gap-3">
                      <div className="h-[6px] w-[110px] overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-full rounded-full bg-[#12B76A]"
                          style={{
                            width: `${product.performance}%`,
                          }}
                        />
                      </div>

                      <span className="min-w-[38px] text-[12px] font-bold text-[#667085]">
                        {product.performance}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-[#667085]">
                    <ArrowUpRight className="h-6 w-6" />

                    <p className="text-[14px] font-semibold">
                      No top products available
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}