"use client";

type Product = {
  id?: string | number;
  item?: string;
  name?: string;
  product_name?: string;
  code?: string;
  skuCode?: string;
  sku_code?: string;
  category?: string;
  metalType?: string;
  metal_type?: string;
  purity?: string;
  netWt?: string;
  stoneWt?: string;
  grossWt?: string;
  checklist?: boolean;
  auditStatus?: string;
  audit_status?: string;
};

function text(value: unknown, fallback = "-") {
  const clean = String(value ?? "").trim();
  return clean ? clean : fallback;
}

export default function InventoryAuditTable({
  products = [],
}: {
  products?: Product[];
}) {
  const rows = Array.isArray(products) ? products : [];

  return (
    <div className="mt-[64px]">
      <h2 className="text-[28px] font-bold tracking-[-0.04em] text-erp-heading">
        Inventory Audit Report
      </h2>

      <p className="mt-[6px] text-[15px] font-medium text-erp-muted">
        Verify your inventory stock with 100% accuracy
      </p>

      <div className="mt-[20px] overflow-hidden rounded-[24px] border border-erp-border bg-white shadow-erp-card">
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[1180px] text-left">
            <thead className="sticky top-0 z-10 bg-[#050816] text-white">
              <tr>
                {[
                  "Item",
                  "Code",
                  "SKU Code",
                  "Category",
                  "Metal",
                  "Purity",
                  "Net Wt.",
                  "Stone Wt.",
                  "Gross Wt.",
                  "Checklist",
                  "Status",
                ].map((head) => (
                  <th
                    key={head}
                    className="whitespace-nowrap px-5 py-4 text-[13px] font-bold"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.length ? (
                rows.map((item, index) => {
                  const status = text(item.auditStatus || item.audit_status, "pending");

                  return (
                    <tr
                      key={item.id || index}
                      className="border-b border-erp-border last:border-b-0 hover:bg-erp-card-soft"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-[13px] font-semibold text-erp-heading">
                        {text(item.item || item.name || item.product_name)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[13px] text-erp-text">
                        {text(item.code)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[13px] text-erp-text">
                        {text(item.skuCode || item.sku_code)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[13px] text-erp-text">
                        {text(item.category)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[13px] text-erp-text">
                        {text(item.metalType || item.metal_type)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[13px] font-semibold text-erp-heading">
                        {text(item.purity)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[13px] text-erp-text">
                        {text(item.netWt, "0g")}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[13px] text-erp-text">
                        {text(item.stoneWt, "0g")}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[13px] text-erp-text">
                        {text(item.grossWt, "0g")}
                      </td>

                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={Boolean(item.checklist)}
                          readOnly
                          className="h-4 w-4 rounded border-erp-border accent-erp-primary"
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-full bg-erp-warning-soft px-3 py-1 text-[12px] font-bold capitalize text-erp-warning">
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={11}
                    className="px-5 py-12 text-center text-[14px] font-medium text-erp-muted"
                  >
                    No inventory audit data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}