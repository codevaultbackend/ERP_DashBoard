"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  CheckCircle2,
  Package,
  Truck,
  X,
} from "lucide-react";
import type { RequestCardData } from "@/app/(erp)/retail/request/page";

/* ================= HELPERS ================= */

function normalize(value?: unknown) {
  return String(value || "").trim().toLowerCase();
}

function formatDate(date?: string) {
  if (!date) return "Not found";
  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Not found";
  }
}

function formatNum(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(3).replace(/\.?0+$/, "") : "0";
}

function isDispatched(item: RequestCardData) {
  const status = normalize(item?.status);
  const transferStatus = normalize(item?.raw?.transfer?.status);

  return (
    status === "dispatch" ||
    status === "dispatched" ||
    transferStatus === "in_transit" ||
    transferStatus === "received" ||
    transferStatus === "dispatched"
  );
}

/* ================= BADGES ================= */

function StatusBadge({ item }: { item: RequestCardData }) {
  const dispatched = isDispatched(item);
  const status = normalize(item?.status) || "pending";

  if (dispatched) {
    return (
      <span className="inline-flex h-[34px] items-center justify-center gap-2 rounded-erp-full bg-erp-success px-5 text-[14px] font-medium text-white sm:min-w-[130px]">
        <Truck className="h-4 w-4" />
        Dispatch
      </span>
    );
  }

  if (status === "approved" || status === "completed") {
    return (
      <span className="inline-flex h-[26px] items-center rounded-erp-full bg-erp-success-soft px-3 text-[13px] font-medium text-[#15803D]">
        approved
      </span>
    );
  }

  return (
    <span className="inline-flex h-[26px] items-center rounded-erp-full bg-erp-border-soft px-3 text-[13px] font-medium text-erp-muted capitalize">
      {status.replaceAll("_", " ") || "Not found"}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  const key = normalize(priority) || "medium";

  const cls =
    key === "high"
      ? "border-[#FF9B8F] bg-[#FFF1F0] text-[#F04438]"
      : key === "low"
        ? "border-[#86EFAC] bg-[#F0FDF4] text-[#16A34A]"
        : "border-[#F5C27B] bg-[#FFF3E2] text-[#F59E0B]";

  return (
    <span
      className={`inline-flex h-[24px] items-center rounded-erp-full border px-3 text-[13px] capitalize ${cls}`}
    >
      {key || "Not found"}
    </span>
  );
}

/* ================= TYPES ================= */

type ProductRow = {
  requestItemId: number | string;
  itemId: number | string;
  category: string;
  name: string;
  articleCode: string;
  skuCode: string;
  metalType: string;
  purity: string;
  unit: string;
  requestedQty: number;
  approvedQty: number;
  grossWeight: number;
  netWeight: number;
  status: string;
};

type CategoryGroup = {
  category: string;
  totalQty: number;
  products: ProductRow[];
};

type Props = {
  item: RequestCardData;
  compact?: boolean;
  onDispatch?: (item: RequestCardData) => void;
  onTransfer?: (item: RequestCardData) => void;
};

/* ================= MAIN ================= */



export default function StockRequestCard({
  item,
  onDispatch,
  onTransfer,
}: Props) {
  const dispatched = isDispatched(item);
  const createdDate = formatDate(item?.raw?.createdAt);

  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(
    null
  );

  const categories = useMemo<CategoryGroup[]>(() => {
    const requestItems = Array.isArray(item?.raw?.request_items)
      ? item.raw.request_items
      : [];

    const grouped = new Map<string, CategoryGroup>();

    requestItems.forEach((ri: any) => {
      const product: ProductRow = {
        requestItemId: ri?.id ?? `${ri?.item_id ?? "item"}-${Math.random()}`,
        itemId: ri?.item_id ?? ri?.item?.id ?? "Not found",
        category: ri?.item?.category || item?.raw?.category || "Other",
        name: ri?.item?.item_name || ri?.item?.article_code || "Not found",
        articleCode: ri?.item?.article_code || "Not found",
        skuCode: ri?.item?.sku_code || "Not found",
        metalType: ri?.item?.metal_type || "Not found",
        purity: ri?.item?.purity || "Not found",
        unit: ri?.item?.unit || "Not found",
        requestedQty: Number(ri?.request_qty ?? 0) || 0,
        approvedQty: Number(ri?.approved_qty ?? 0) || 0,
        grossWeight: Number(ri?.item?.gross_weight ?? 0) || 0,
        netWeight: Number(ri?.item?.net_weight ?? 0) || 0,
        status: ri?.status || "pending",
      };

      if (!grouped.has(product.category)) {
        grouped.set(product.category, {
          category: product.category,
          totalQty: 0,
          products: [],
        });
      }

      const group = grouped.get(product.category)!;
      group.products.push(product);
      group.totalQty += product.requestedQty;
    });

    return Array.from(grouped.values());
  }, [item?.raw?.request_items, item?.raw?.category]);

  const handleDispatchClick = () => {
    if (dispatched) return;
    onDispatch?.(item);
  };

  return (
    <article
      role={onDispatch && !dispatched ? "button" : undefined}
      tabIndex={onDispatch && !dispatched ? 0 : -1}
      onClick={handleDispatchClick}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !dispatched) {
          e.preventDefault();
          handleDispatchClick();
        }
      }}
      className={[
        "w-full rounded-erp-xl border bg-erp-card px-5 py-5 text-left shadow-erp-card transition sm:px-6 sm:py-6",
        onDispatch && !dispatched
          ? "cursor-pointer border-erp-border hover:-translate-y-[1px] hover:border-[#CBD5E1]"
          : "border-erp-border",
      ].join(" ")}
    >
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-[20px] font-semibold text-erp-heading">
            {item?.id ?? "Not found"}
          </h3>

          {dispatched && (
            <p className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-erp-success">
              <CheckCircle2 className="h-4 w-4" />
              Already dispatched
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onTransfer && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTransfer(item);
              }}
              className="h-[36px] rounded-full border border-[#D0D5DD] px-5 text-[14px] font-medium"
            >
              Transfer
            </button>
          )}

          <StatusBadge item={item} />
        </div>
      </div>

      {/* INFO */}
      <div className="mt-6 grid grid-cols-2 gap-5">
        <div>
          <p className="text-[16px] text-erp-muted">Priority:</p>
          <div className="mt-2">
            <PriorityBadge priority={item?.priority} />
          </div>
        </div>

        <div>
          <p className="text-[16px] text-erp-muted">Created:</p>
          <p className="mt-2 text-[16px] font-medium text-[#2C3444]">
            {createdDate}
          </p>
        </div>
      </div>

      {/* CATEGORY → PRODUCTS → DETAILS */}
      <div
        className="mt-7"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <p className="text-[15px] font-semibold text-[#2C3444]">
          Requested Categories:
        </p>

        {categories.length === 0 ? (
          <div className="mt-3 rounded-erp-sm bg-erp-card-soft px-4 py-3 text-[14px] text-erp-muted">
            No categories found
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {categories.map((category) => {
              const isOpen = openCategory === category.category;

              return (
                <div
                  key={category.category}
                  className="overflow-hidden rounded-erp-md border border-erp-border bg-white"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenCategory(isOpen ? null : category.category);
                      setSelectedProduct(null);
                    }}
                    className="flex min-h-[68px] w-full items-center justify-between gap-3 bg-erp-card-soft px-4 py-3 text-left transition hover:bg-[#F1F5F9]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-erp-full bg-white text-erp-primary shadow-sm">
                        <Package className="h-5 w-5" />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-[16px] font-semibold text-erp-heading">
                          {category.category}
                        </p>
                        <p className="mt-1 text-[13px] text-erp-muted">
                          {category.products.length} product
                          {category.products.length > 1 ? "s" : ""} • Qty{" "}
                          {formatNum(category.totalQty)}
                        </p>
                      </div>
                    </div>

                    <ChevronDown
                      className={[
                        "h-[18px] w-[18px] shrink-0 text-[#111827] transition-transform",
                        isOpen ? "rotate-180" : "",
                      ].join(" ")}
                    />
                  </button>

                  {isOpen && (
                    <div className="space-y-3 border-t border-erp-border bg-white p-3">
                      {category.products.map((product) => {
                        const selected =
                          selectedProduct?.requestItemId ===
                          product.requestItemId;

                        return (
                          <div key={product.requestItemId}>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedProduct(
                                  selected ? null : product
                                )
                              }
                              className={[
                                "flex min-h-[66px] w-full items-center justify-between gap-3 rounded-erp-sm border px-4 py-3 text-left transition",
                                selected
                                  ? "border-erp-primary bg-erp-primary-soft"
                                  : "border-erp-border bg-white hover:bg-erp-card-soft",
                              ].join(" ")}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-[15px] font-semibold text-erp-heading">
                                  {product.name}
                                </p>
                                <p className="mt-1 text-[13px] text-erp-muted">
                                  {product.articleCode} • Qty{" "}
                                  {formatNum(product.requestedQty)}
                                </p>
                              </div>

                              <ChevronDown
                                className={[
                                  "h-[17px] w-[17px] shrink-0 text-[#111827] transition-transform",
                                  selected ? "rotate-180" : "",
                                ].join(" ")}
                              />
                            </button>

                            {selected && (
                              <div className="mt-3 rounded-erp-md border border-[#DCE5F2] bg-[#FBFDFF] p-4">
                                <div className="mb-4 flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-[15px] font-semibold text-erp-heading">
                                      Product Details
                                    </p>
                                    <p className="mt-1 truncate text-[13px] text-erp-muted">
                                      {product.name}
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setSelectedProduct(null)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-erp-muted shadow-sm hover:text-erp-heading"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  <Detail label="Item ID" value={product.itemId} />
                                  <Detail
                                    label="Article Code"
                                    value={product.articleCode}
                                  />
                                  <Detail label="SKU Code" value={product.skuCode} />
                                  <Detail
                                    label="Metal Type"
                                    value={product.metalType}
                                  />
                                  <Detail label="Purity" value={product.purity} />
                                  <Detail label="Unit" value={product.unit} />
                                  <Detail
                                    label="Requested Qty"
                                    value={formatNum(product.requestedQty)}
                                  />
                                  <Detail
                                    label="Approved Qty"
                                    value={formatNum(product.approvedQty)}
                                  />
                                  <Detail
                                    label="Gross Weight"
                                    value={formatNum(product.grossWeight)}
                                  />
                                  <Detail
                                    label="Net Weight"
                                    value={formatNum(product.netWeight)}
                                  />
                                  <Detail
                                    label="Status"
                                    value={product.status.replaceAll("_", " ")}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-erp-sm bg-white px-3 py-2 shadow-sm">
      <p className="text-[12px] font-medium text-erp-muted">{label}</p>
      <p className="mt-1 break-words text-[14px] font-semibold capitalize text-[#2C3444]">
        {String(value || "Not found")}
      </p>
    </div>
  );
}