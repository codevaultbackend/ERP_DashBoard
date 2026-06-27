"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ImageIcon,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getStoreInventory,
  type InventoryRow,
} from "@/features/head-office/store-management/api/store-management-api";
import { useDragScroll } from "@/shared/hooks/useDragScroll";

type StockItem = {
  id: string;
  itemId: number;
  image: string;
  article: string;
  code: string;
  quantity: number;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
  status: string;
};

type CategoryRow = {
  id: string;
  category: string;
  code: string;
  quantity: number;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
  items: StockItem[];
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeDecode(value?: string | string[]) {
  const raw = Array.isArray(value) ? value[0] : value;

  try {
    return decodeURIComponent(raw || "");
  } catch {
    return raw || "";
  }
}

function formatTitle(value?: string | string[]) {
  const raw = safeDecode(value);

  if (!raw) return "Store";

  return raw
    .replace(/_/g, " ")
    .split("-")
    .filter(Boolean)
    .map((word) => {
      if (/^[A-Z0-9]+$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function formatMoney(value?: number | string) {
  const amount = Number(value || 0);

  if (!amount) return "₹0";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;

  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatWeight(value?: number | string) {
  const amount = Number(value || 0);

  if (!amount) return "0g";

  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)}g`;
}

function toNumber(value?: number | string) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

function makeId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getItemCode(item: InventoryRow) {
  return String(
    item.code ||
    item.sku_code ||
    item.article_code ||
    item.item_id ||
    item.id ||
    "-"
  );
}

function getItemName(item: InventoryRow) {
  return String(item.item_name || item.article || item.category || "Item");
}

function getItemQty(item: InventoryRow) {
  return toNumber(item.quantity || item.qty || item.available_qty);
}

function getSellingPrice(item: InventoryRow) {
  return item.selling_price || item.sale_rate || item.rate || 0;
}

function getMakingCharge(item: InventoryRow) {
  return item.making_charge || item.making_charges || 0;
}

function getImage(item: InventoryRow) {
  return String(item.image_url || item.image || item.item_image || "");
}

function normalizeInventoryData(resData?: InventoryRow[]) {
  if (!Array.isArray(resData)) return [];
  return resData;
}

function mapStockItem(
  item: InventoryRow,
  category: string,
  index: number
): StockItem {
  const code = getItemCode(item);

  return {
    id: `${makeId(category)}-${makeId(code)}-${index}`,
    itemId: Number(item.item_id),
    image: getImage(item),
    article: getItemName(item),
    code,
    quantity: getItemQty(item),
    sellingPrice: formatMoney(getSellingPrice(item)),
    makingCharge: formatMoney(getMakingCharge(item)),
    purity: String(item.purity || "-"),
    netWeight: formatWeight(item.net_weight),
    stoneWeight: formatWeight(item.stone_weight),
    grossWeight: formatWeight(item.gross_weight),
    status: String(item.status || "Available"),
  };
}

function buildCategoryRows(items: InventoryRow[]): CategoryRow[] {
  const grouped = new Map<string, InventoryRow[]>();

  items.forEach((item) => {
    const category = String(item.category || "Unknown");
    const current = grouped.get(category) || [];

    current.push(item);
    grouped.set(category, current);
  });

  return Array.from(grouped.entries()).map(([category, categoryItems]) => {
    const first = categoryItems[0] || {};
    const stockItems = categoryItems.map((item, index) =>
      mapStockItem(item, category, index)
    );

    const totalQty = stockItems.reduce((sum, item) => sum + item.quantity, 0);

    const netWeight = categoryItems.reduce(
      (sum, item) => sum + toNumber(item.net_weight),
      0
    );

    const stoneWeight = categoryItems.reduce(
      (sum, item) => sum + toNumber(item.stone_weight),
      0
    );

    const grossWeight = categoryItems.reduce(
      (sum, item) => sum + toNumber(item.gross_weight),
      0
    );

    return {
      id: makeId(category),
      category,
      code: getItemCode(first),
      quantity: totalQty,
      sellingPrice: formatMoney(getSellingPrice(first)),
      makingCharge: formatMoney(getMakingCharge(first)),
      purity: String(first.purity || "-"),
      netWeight: formatWeight(netWeight),
      stoneWeight: formatWeight(stoneWeight),
      grossWeight: formatWeight(grossWeight),
      items: stockItems,
    };
  });
}

export default function RetailStoreCategoryPage({
  districtId,
  storeId,
}: {
  districtId?: string;
  storeId?: string;
}) {
  const router = useRouter();
  const params = useParams<{
    districtId?: string | string[];
    storeId?: string | string[];
  }>();

  const categoryRef = useRef<HTMLDivElement | null>(null);

  const cleanDistrictId = safeDecode(districtId || params?.districtId);
  const cleanStoreId = safeDecode(storeId || params?.storeId);

  const districtName = formatTitle(cleanDistrictId);
  const storeName = formatTitle(cleanStoreId);

  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [openCategory, setOpenCategory] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [preview, setPreview] = useState<StockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [childLoadingId, setChildLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");




  async function loadInventory(storeCode: string) {
    try {
      setLoading(true);
      setError("");

      const res = await getStoreInventory(storeCode);
      const rawItems = normalizeInventoryData(res?.data);
      const mappedRows = buildCategoryRows(rawItems);

      setRows(mappedRows);
      setOpenId(mappedRows[0]?.id || null);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!cleanStoreId) {
      setRows([]);
      setLoading(false);
      setError("Store code missing from URL. Expected path: /stores/:store_code");
      return;
    }

    loadInventory(cleanStoreId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanStoreId]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!categoryRef.current) return;

      if (!categoryRef.current.contains(event.target as Node)) {
        setOpenCategory(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!preview) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [preview]);

  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(rows.map((row) => row.category)))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((row) => {
      const matchCategory = category === "All" || row.category === category;

      const matchSearch =
        !q ||
        row.category.toLowerCase().includes(q) ||
        row.code.toLowerCase().includes(q) ||
        row.items.some(
          (item) =>
            item.article.toLowerCase().includes(q) ||
            item.code.toLowerCase().includes(q)
        );

      return matchCategory && matchSearch;
    });
  }, [rows, search, category]);

  async function handleToggle(row: CategoryRow) {
    const isOpen = openId === row.id;

    if (isOpen) {
      setOpenId(null);
      return;
    }

    setOpenId(row.id);

    if (!cleanStoreId) {
      setError("Store code missing from URL.");
      return;
    }

    try {
      setChildLoadingId(row.id);

      const res = await getStoreInventory(cleanStoreId, row.category);
      const items = normalizeInventoryData(res?.data).map((item, index) =>
        mapStockItem(item, row.category, index)
      );

      setRows((prev) =>
        prev.map((current) =>
          current.id === row.id
            ? {
              ...current,
              items,
            }
            : current
        )
      );
    } catch {
      // Keep already loaded parent data stable.
    } finally {
      setChildLoadingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-erp-bg text-erp-text">
      <section className="mx-auto w-full max-w-[1500px]">
        <div className="mb-5 flex items-center gap-4">
          <button
            type="button"
            onClick={() =>
              router.push(
                `/head-office/store-management/${encodeURIComponent(
                  cleanDistrictId
                )}/stores`
              )
            }
            className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[16px] border border-erp-border bg-erp-card text-erp-text shadow-erp-card transition hover:bg-erp-card-soft sm:h-[54px] sm:w-[54px] sm:rounded-[18px]"
            aria-label="Go back"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          <h1 className="truncate text-[28px] font-bold leading-tight tracking-[-0.04em] text-erp-text sm:text-[36px]">
            {storeName}
          </h1>
        </div>

        <div className="rounded-[24px] border border-erp-border bg-erp-card p-3 shadow-erp-card sm:rounded-[30px] sm:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex h-[42px] flex-1 items-center rounded-erp-full bg-[#F4F4F5] px-4 sm:h-[44px]">
              <Search className="mr-3 h-5 w-5 shrink-0 text-[#8A94A6]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search inventory..."
                className="max-[768px]:h-[36px] w-full bg-transparent text-[14px] font-medium text-erp-text outline-none placeholder:text-erp-muted sm:text-[15px]"
              />
            </div>

            <div ref={categoryRef} className="relative">
              <button
                type="button"
                onClick={() => setOpenCategory((prev) => !prev)}
                className="flex h-[42px] w-full items-center justify-between rounded-erp-full bg-white px-5 text-[14px] font-semibold text-erp-text shadow-erp-sm transition hover:bg-erp-card-soft md:min-w-[160px] sm:h-[44px] sm:text-[15px]"
              >
                <span className="truncate">{category}</span>

                <ChevronDown
                  className={cn(
                    "ml-3 h-4 w-4 shrink-0 transition",
                    openCategory && "rotate-180"
                  )}
                />
              </button>

              {openCategory ? (
                <div className="absolute right-0 top-[50px] z-40 w-full min-w-[190px] overflow-hidden rounded-[18px] border border-erp-border bg-white p-2 shadow-erp-card">
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCategory(item);
                        setOpenCategory(false);
                      }}
                      className={cn(
                        "block w-full rounded-[12px] px-4 py-2.5 text-left text-[14px] font-semibold transition",
                        category === item
                          ? "bg-[#EEF5FF] text-[#0B63CE]"
                          : "text-erp-text hover:bg-erp-card-soft"
                      )}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[16px] font-medium text-erp-muted sm:text-[18px]">
            Main Warehouse / {districtName} / {storeName}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
            <Link
              href={`/head-office/store-management/${encodeURIComponent(
                cleanDistrictId
              )}`}
              className="flex h-[42px] min-w-0 items-center justify-center rounded-erp-full bg-erp-dark px-5 text-[14px] font-semibold text-white transition hover:brightness-110 sm:h-[44px] sm:min-w-[132px] sm:px-7 sm:text-[15px]"
            >
              Districts
            </Link>

            <Link
              href={`/head-office/store-management/${encodeURIComponent(
                cleanDistrictId
              )}/stores`}
              className="flex h-[42px] min-w-0 items-center justify-center rounded-erp-full bg-erp-dark px-5 text-[14px] font-semibold text-white transition hover:brightness-110 sm:h-[44px] sm:min-w-[132px] sm:px-7 sm:text-[15px]"
            >
              Retail Stores
            </Link>
          </div>
        </div>

        {error ? (
          <div className="mt-5 flex flex-col gap-3 rounded-[18px] border border-red-200 bg-red-50 px-5 py-4 text-[14px] font-semibold text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <span>{error}</span>

            {cleanStoreId ? (
              <button
                type="button"
                onClick={() => loadInventory(cleanStoreId)}
                className="h-[36px] shrink-0 rounded-full bg-white px-4 text-[13px] font-bold text-red-700"
              >
                Retry
              </button>
            ) : null}
          </div>
        ) : null}

        <DesktopInventoryTable
          rows={filteredRows}
          loading={loading}
          openId={openId}
          childLoadingId={childLoadingId}
          onToggle={handleToggle}
          onPreview={setPreview}
        />

        <MobileInventoryCards
          rows={filteredRows}
          loading={loading}
          openId={openId}
          childLoadingId={childLoadingId}
          onToggle={handleToggle}
          onPreview={setPreview}
        />
      </section>

      {preview ? (
        <PreviewModal item={preview} onClose={() => setPreview(null)} />
      ) : null}
    </main>
  );
}

function DesktopInventoryTable({
  rows,
  loading,
  openId,
  childLoadingId,
  onToggle,
  onPreview,
}: {
  rows: CategoryRow[];
  loading: boolean;
  openId: string | null;
  childLoadingId: string | null;
  onToggle: (row: CategoryRow) => void;
  onPreview: (item: StockItem) => void;
}) {
  const headers = [
    "Category",
    "Code",
    "Qty",
    "Selling Price",
    "Making Chg.",
    "Purity",
    "Net Wt.",
    "Stone Wt.",
    "Gross Wt.",
    "Action",
  ];
  const router = useRouter();
  const drag = useDragScroll<HTMLDivElement>();

  return (
    <div className="mt-6 hidden overflow-hidden rounded-[26px] border border-erp-border bg-erp-card shadow-erp-card lg:block xl:rounded-[30px]">
      <div
        className="
    w-full
    overflow-x-auto
    overflow-y-auto
    lg:max-h-[calc(100vh-300px)]
    overflow-x-auto
      cursor-grab
      active:cursor-grabbing
  "ref={drag.ref}
        onPointerDown={drag.onPointerDown}
        onPointerMove={drag.onPointerMove}
        onPointerUp={drag.onPointerUp}
        onPointerLeave={drag.onPointerLeave}
      >
        <table className="w-full min-w-[1120px] border-separate border-spacing-0 text-left">
          <thead className="sticky top-0 z-20">
            <tr className="h-[58px] bg-black text-white xl:h-[62px]">
              {headers.map((head, index) => (
                <th
                  key={head}
                  className={cn(
                    "whitespace-nowrap px-4 text-[13px] font-bold tracking-[-0.01em] xl:px-6 xl:text-[14px]",
                    index === 0 && "rounded-tl-[26px] xl:rounded-tl-[30px]",
                    index === headers.length - 1 &&
                    "rounded-tr-[26px] xl:rounded-tr-[30px]",
                    index >= 2 && "text-center"
                  )}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="h-[220px] bg-white">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-7 w-7 animate-spin text-erp-text" />
                  </div>
                </td>
              </tr>
            ) : null}

            {!loading &&
              rows.map((row) => {
                const isOpen = openId === row.id;
                const isChildLoading = childLoadingId === row.id;

                return (
                  <Fragment key={row.id}>
                    <tr className="h-[58px] bg-white text-[14px] font-medium text-erp-text transition hover:bg-[#FAFBFD] xl:h-[62px] xl:text-[15px]">
                      <td className="border-b border-r border-erp-border px-4 font-semibold xl:px-6">
                        <span className="line-clamp-1">{row.category}</span>
                      </td>

                      <td className="border-b border-r border-erp-border px-4 text-erp-muted xl:px-6">
                        <span className="line-clamp-1">{row.code}</span>
                      </td>

                      <td className="border-b border-r border-erp-border px-4 text-center xl:px-6">
                        {row.quantity}
                      </td>

                      <td className="border-b border-r border-erp-border px-4 text-center font-semibold xl:px-6">
                        {row.sellingPrice}
                      </td>

                      <td className="border-b border-r border-erp-border px-4 text-center font-semibold xl:px-6">
                        {row.makingCharge}
                      </td>

                      <td className="border-b border-r border-erp-border px-4 text-center font-semibold xl:px-6">
                        {row.purity}
                      </td>

                      <td className="border-b border-r border-erp-border px-4 text-center font-semibold xl:px-6">
                        {row.netWeight}
                      </td>

                      <td className="border-b border-r border-erp-border px-4 text-center font-semibold xl:px-6">
                        {row.stoneWeight}
                      </td>

                      <td className="border-b border-r border-erp-border px-4 text-center font-semibold xl:px-6">
                        {row.grossWeight}
                      </td>

                      <td className="border-b border-erp-border px-4 text-center xl:px-6">
                        <button
                          type="button"
                          onClick={() => onToggle(row)}
                          className="inline-flex h-[34px] items-center justify-center gap-1 rounded-full px-3 text-[14px] font-bold text-[#2563EB] transition hover:bg-[#EEF5FF]"
                        >
                          View
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {isOpen ? (
                      <>
                        <tr className="h-[44px] bg-[#EEF4FA] text-[12px] font-bold text-[#475467] xl:h-[46px] xl:text-[13px]">
                          <td className="px-4 xl:px-6">View Article</td>
                          <td className="border-l border-erp-border px-4 xl:px-6">
                            Article
                          </td>
                          <td className="border-l border-erp-border px-4 xl:px-6">
                            Code
                          </td>
                          <td className="border-l border-erp-border px-4 text-center xl:px-6">
                            Qty
                          </td>
                          <td className="border-l border-erp-border px-4 text-center xl:px-6">
                            Selling Price
                          </td>
                          <td className="border-l border-erp-border px-4 text-center xl:px-6">
                            Making Chg.
                          </td>
                          <td className="border-l border-erp-border px-4 text-center xl:px-6">
                            Purity
                          </td>
                          <td className="border-l border-erp-border px-4 text-center xl:px-6">
                            Net Wt.
                          </td>
                          <td className="border-l border-erp-border px-4 text-center xl:px-6">
                            Gross Wt.
                          </td>
                          <td className="border-l border-erp-border px-4 text-center xl:px-6">
                            Action
                          </td>
                        </tr>

                        {isChildLoading ? (
                          <tr>
                            <td colSpan={10} className="h-[90px] bg-[#F4F8FB]">
                              <div className="flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-erp-text" />
                              </div>
                            </td>
                          </tr>
                        ) : null}

                        {!isChildLoading &&
                          row.items.map((item) => (
                            <tr
                              key={item.id}
                              className="h-[64px] bg-[#F4F8FB] text-[14px] font-medium text-erp-text transition hover:bg-[#EEF5FB] xl:text-[15px]"
                            >
                              <td className="border-b border-erp-border px-4 xl:px-6">
                                <button
                                  type="button"
                                  onClick={() => onPreview(item)}
                                  className="group flex h-[42px] w-[82px] items-center gap-2 rounded-[10px] bg-[#F3D8E8] px-2 text-left transition hover:bg-[#ECC6DB]"
                                >
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.article}
                                        className="h-full w-full object-cover transition group-hover:scale-110"
                                        onError={(event) => {
                                          event.currentTarget.style.display =
                                            "none";
                                        }}
                                      />
                                    ) : (
                                      <ImageIcon className="h-4 w-4 text-erp-muted" />
                                    )}
                                  </span>

                                  <span className="text-[13px] font-semibold text-erp-text">
                                    View
                                  </span>
                                </button>
                              </td>

                              <td className="border-b border-l border-erp-border px-4 xl:px-6">
                                <span className="line-clamp-1">
                                  {item.article}
                                </span>
                              </td>

                              <td className="border-b border-l border-erp-border px-4 xl:px-6">
                                {item.code}
                              </td>

                              <td className="border-b border-l border-erp-border px-4 text-center xl:px-6">
                                {item.quantity}
                              </td>

                              <td className="border-b border-l border-erp-border px-4 text-center font-semibold xl:px-6">
                                {item.sellingPrice}
                              </td>

                              <td className="border-b border-l border-erp-border px-4 text-center font-semibold xl:px-6">
                                {item.makingCharge}
                              </td>

                              <td className="border-b border-l border-erp-border px-4 text-center xl:px-6">
                                {item.purity}
                              </td>

                              <td className="border-b border-l border-erp-border px-4 text-center xl:px-6">
                                {item.netWeight}
                              </td>

                              <td className="border-b border-l border-erp-border px-4 text-center xl:px-6">
                                {item.grossWeight}
                              </td>



                              <td className="border-b border-l border-erp-border px-4 text-center xl:px-6">
                                <button
                                  type="button"
                                  className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                                  onClick={() => {
                                    console.log("Inventory Item", item);
                                    if (!item.itemId) return;
                                    router.push(`/head-office/tracking/${item.itemId}`);
                                  }}
                                >
                                  Track
                                </button>
                              </td>

                            </tr>
                          ))}

                        {!isChildLoading && row.items.length === 0 ? (
                          <tr>
                            <td
                              colSpan={10}
                              className="h-[90px] bg-[#F4F8FB] text-center text-[14px] font-semibold text-erp-muted"
                            >
                              No items found in this category.
                            </td>
                          </tr>
                        ) : null}
                      </>
                    ) : null}
                  </Fragment>
                );
              })}

            {!loading && rows.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="h-[180px] bg-white text-center text-[15px] font-semibold text-erp-muted"
                >
                  No stock category found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MobileInventoryCards({
  rows,
  loading,
  openId,
  childLoadingId,
  onToggle,
  onPreview,
}: {
  rows: CategoryRow[];
  loading: boolean;
  openId: string | null;
  childLoadingId: string | null;
  onToggle: (row: CategoryRow) => void;
  onPreview: (item: StockItem) => void;
}) {
  const router = useRouter();
  if (loading) {
    return (
      <div className="mt-6 flex h-[220px] items-center justify-center rounded-[24px] border border-erp-border bg-erp-card shadow-erp-card lg:hidden">
        <Loader2 className="h-7 w-7 animate-spin text-erp-text" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="mt-6 flex h-[180px] items-center justify-center rounded-[24px] border border-erp-border bg-erp-card text-[15px] font-semibold text-erp-muted shadow-erp-card lg:hidden">
        No stock category found.
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4 lg:hidden">
      {rows.map((row) => {
        const isOpen = openId === row.id;
        const isChildLoading = childLoadingId === row.id;

        return (
          <div
            key={row.id}
            className="overflow-hidden rounded-[24px] border border-erp-border bg-erp-card shadow-erp-card"
          >
            <button
              type="button"
              onClick={() => onToggle(row)}
              className="flex w-full items-start justify-between gap-3 p-4 text-left"
            >
              <div className="min-w-0">
                <h3 className="truncate text-[18px] font-bold text-erp-text">
                  {row.category}
                </h3>

                <p className="mt-1 text-[14px] font-medium text-erp-muted">
                  {row.code}
                </p>
              </div>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-erp-card-soft">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-3 px-4 pb-4 sm:grid-cols-3">
              <Info label="Qty" value={row.quantity} />
              <Info label="Selling Price" value={row.sellingPrice} />
              <Info label="Making Chg." value={row.makingCharge} />
              <Info label="Purity" value={row.purity} />
              <Info label="Net Wt." value={row.netWeight} />
              <Info label="Gross Wt." value={row.grossWeight} />
            </div>

            {isOpen ? (
              <div className="border-t border-erp-border bg-[#F4F8FB] p-4">
                {isChildLoading ? (
                  <div className="flex h-[90px] items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-erp-text" />
                  </div>
                ) : null}

                {!isChildLoading && row.items.length === 0 ? (
                  <div className="flex h-[70px] items-center justify-center rounded-[16px] bg-white text-[13px] font-semibold text-erp-muted">
                    No items found.
                  </div>
                ) : null}

                {!isChildLoading && row.items.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {row.items.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[18px] border border-erp-border bg-white p-3"
                      >
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => onPreview(item)}
                            className="flex h-[68px] w-[78px] shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-erp-card-soft"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.article}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-erp-muted" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-[15px] font-bold text-erp-text">
                              {item.article}
                            </h4>

                            <p className="mt-1 text-[13px] font-medium text-erp-muted">
                              {item.code}
                            </p>

                            <p className="mt-2 text-[14px] font-bold text-erp-text">
                              {item.sellingPrice}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Info label="Qty" value={item.quantity} />
                          <Info label="Purity" value={item.purity} />
                          <Info label="Net Wt." value={item.netWeight} />
                          <Info label="Gross Wt." value={item.grossWeight} />
                        </div>

                        <div className="mt-3 flex items-center justify-between">

                          <button
                            type="button"
                            onClick={() => {
                              if (!item.itemId) return;
                              router.push(`/head-office/tracking/${item.itemId}`);
                            }}
                            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                          >
                            Track
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[14px] bg-erp-card-soft px-3 py-2">
      <p className="text-[12px] font-medium text-erp-muted">{label}</p>

      <p className="mt-1 truncate text-[14px] font-bold text-erp-text">
        {value}
      </p>
    </div>
  );
}

function PreviewModal({
  item,
  onClose,
}: {
  item: StockItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-erp-border px-5 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-[19px] font-bold text-erp-text">
              {item.article}
            </h3>

            <p className="text-[13px] font-medium text-erp-muted">
              Code: {item.code}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-erp-card-soft transition hover:bg-[#E2E8F0]"
            aria-label="Close preview"
          >
            <X className="h-5 w-5 text-erp-text" />
          </button>
        </div>

        <div className="bg-[#F8FAFC] p-5">
          <div className="flex h-[280px] items-center justify-center overflow-hidden rounded-[22px] border border-erp-border bg-white sm:h-[360px]">
            {item.image ? (
              <img
                src={item.image}
                alt={item.article}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center text-erp-muted">
                <ImageIcon className="h-10 w-10" />

                <p className="mt-2 text-sm font-semibold">
                  Image not available
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <PreviewInfo label="Qty" value={item.quantity} />
            <PreviewInfo label="Purity" value={item.purity} />
            <PreviewInfo label="Net Wt." value={item.netWeight} />
            <PreviewInfo label="Gross Wt." value={item.grossWeight} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewInfo({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[14px] border border-erp-border bg-white px-3 py-3 text-center">
      <p className="text-[12px] font-semibold text-erp-muted">{label}</p>

      <p className="mt-1 text-[15px] font-bold text-erp-text">{value}</p>
    </div>
  );
}