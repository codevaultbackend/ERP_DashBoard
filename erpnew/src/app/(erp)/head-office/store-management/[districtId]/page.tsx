"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ImageIcon,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDistrictInventory } from "@/features/head-office/store-management/api/store-management-api";

type ApiInventoryItem = {
  item_id?: number;
  category?: string;
  item_name?: string;
  code?: string;
  sku_code?: string;
  quantity?: number | string;
  selling_price?: number | string;
  sale_rate?: number | string;
  making_charge?: number | string;
  purity?: string;
  net_weight?: number | string;
  stone_weight?: number | string;
  gross_weight?: number | string;
  image?: string;
  image_url?: string;
};

type StockItem = {
  id: string;
  itemId: number;
  image?: string;
  article: string;
  code: string;
  quantity: number;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
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

export default function DistrictStoreStockPage() {
  const router = useRouter();
  const params = useParams<{ districtId: string }>();

  const districtId = decodeURIComponent(params?.districtId ?? "");
  const districtName = formatTitle(districtId);

  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showCategory, setShowCategory] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [preview, setPreview] = useState<StockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [childLoadingId, setChildLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      try {
        setLoading(true);
        setError("");

        const res = await getDistrictInventory(districtId);
        const mapped = (res?.data || []).map(mapCategoryRow);

        if (!mounted) return;

        setRows(mapped);

        if (mapped[0]) {
          setOpenId(mapped[0].id);
          fetchItems(mapped[0].id, mapped[0].category);
        }
      } catch (err) {
        if (!mounted) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load district inventory."
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (districtId) fetchCategories();

    return () => {
      mounted = false;
    };
  }, [districtId]);

  async function fetchItems(rowId: string, selectedCategory: string) {
    try {
      setChildLoadingId(rowId);

      const res = await getDistrictInventory(districtId, selectedCategory);
      const items = (res?.data || []).map((item, index) =>
        mapStockItem(item, selectedCategory, index)
      );

      setRows((prev) =>
        prev.map((row) => (row.id === rowId ? { ...row, items } : row))
      );
    } catch {
      setRows((prev) =>
        prev.map((row) => (row.id === rowId ? { ...row, items: [] } : row))
      );
    } finally {
      setChildLoadingId(null);
    }
  }

  async function handleToggle(row: CategoryRow) {
    if (openId === row.id) {
      setOpenId(null);
      return;
    }

    setOpenId(row.id);

    if (!row.items.length) {
      await fetchItems(row.id, row.category);
    }
  }

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((row) => row.category)))],
    [rows]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;

      const matchesSearch =
        !q ||
        item.category.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.items.some(
          (child) =>
            child.article.toLowerCase().includes(q) ||
            child.code.toLowerCase().includes(q)
        );

      return matchesCategory && matchesSearch;
    });
  }, [rows, search, category]);

  return (
    <main className="min-h-screen bg-[#F4F7FB]">
      <section
        className="
    mx-auto
    w-full
    max-w-[1500px]
  "
      >
        <div className="mb-5 flex items-center gap-3 sm:gap-5">

          <button
            type="button"
            onClick={() => router.push("/head-office/store-management")}
            className="
      flex
      h-13
      w-13
      shrink-0
      items-center
      justify-center
      rounded-2xl
      border
      border-[#E5E7EB]
      bg-white
      shadow-sm
      transition
      hover:bg-[#F8FAFC]

      max-[768px]:h-13
      max-[768px]:w-13
    "
          >
            <ChevronLeft className="h-5 w-5 max-[768px]:h-6 max-[768px]:w-6 lg:h-6 lg:w-6" />
          </button>

          <div className="min-w-0 flex-1">

            <h1
              className="
        text-[15px] sm:text-[17px] lg:text-[18px]
      "
            >
              {districtName}
            </h1>

          </div>

        </div>

        <div
          className="
    rounded-3xl
    border
    border-[#E3E8EF]
    bg-white
    p-3
    shadow-sm

    sm:p-4
  "
        >
          <div
            className="
flex
flex-col
gap-3

md:flex-row
md:items-center
"
          >

            {/* Search */}
            <div
              className="
    flex
    h-11
    w-full
    items-center
    rounded-full
    bg-[#F4F6F9]
    px-4

    sm:h-12
  "
            >
              <Search className="mr-2 h-5 w-5 shrink-0 text-[#94A3B8]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search inventory..."
                className="
h-full
w-full
bg-transparent
text-[14px]
font-medium
text-[#111827]
placeholder:text-[#94A3B8]
outline-none

sm:text-[15px]
"
              />
            </div>


            {/* Category Dropdown */}
            <div className="relative w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowCategory((prev) => !prev)}
                className="
flex
h-11
w-full
items-center
justify-between
rounded-full
border
border-[#E5E7EB]
bg-white
px-4
text-[14px]
font-semibold
text-[#111827]
transition

hover:border-[#CBD5E1]

sm:h-12
sm:min-w-[180px]
"
              >
                <span className="truncate">{category}</span>

                <ChevronDown
                  className={`ml-2 h-4 w-4 shrink-0 transition ${showCategory ? "rotate-180" : ""
                    }`}
                />
              </button>


              {showCategory && (
                <div
                  className="
            absolute left-0 sm:left-auto sm:right-0
            top-[48px] z-30
            w-full sm:w-[190px]
            overflow-hidden
            rounded-[18px]
            border border-[#E5E7EB]
            bg-white p-2
            shadow-[0_16px_40px_rgba(15,23,42,0.12)]
          "
                >
                  {categories.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setCategory(item);
                        setShowCategory(false);
                      }}
                      className={`
                block w-full rounded-[12px]
                px-4 py-2 text-left
                text-[14px] font-semibold transition
                ${category === item
                          ? "bg-[#EEF5FF] text-[#0B63CE]"
                          : "text-[#334155] hover:bg-[#F8FAFC]"
                        }
              `}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        <div
          className="
mt-6
flex
flex-col
gap-4

lg:flex-row
lg:items-center
lg:justify-between
"
        >
          <p
            className="
text-[16px]
font-semibold
text-[#334155]

sm:text-[18px]
"
          >
            Main Warehouse / {districtName}
          </p>

          <div
            className="
grid
grid-cols-2
gap-3

sm:flex
"
          >
            <Link
              href="/head-office/store-management"
              className="
flex
h-11
w-full
items-center
justify-center
rounded-full
bg-[#020315]
px-5
text-[14px]
font-semibold
text-white
transition

hover:bg-[#111827]

sm:min-w-[145px]
sm:w-auto
"
            >
              Districts
            </Link>

            <Link
              href={`/head-office/store-management/${encodeURIComponent(
                districtId
              )}/stores`}
              className="flex h-[44px] min-w-[132px] items-center justify-center rounded-full bg-[#020315] px-7 text-[15px] font-semibold text-white"
            >
              Retail Stores
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-5 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-[14px] font-semibold text-red-700">
            {error}
          </div>
        )}

        <div
          className="
mt-5
overflow-hidden
rounded-3xl
border
border-[#E5E7EB]
bg-white
shadow-sm
"
        >
          <div
            className="
    w-full
    overflow-x-auto
    overflow-y-auto

    lg:max-h-[calc(100vh-300px)]
  "
          >
            <table
              className="
    w-full
    border-collapse
    text-left

    min-w-[980px]
    lg:min-w-[1220px]
  "
            >
              <thead className="sticky top-0 z-20">
                <tr
                  className="
h-12
bg-[#111827]
text-white

lg:h-[60px]
"
                >
                  {[
                    "Category",
                    "Code",
                    "Quantity",
                    "Selling Price",
                    "Making Chg.",
                    "Purity",
                    "Net Wt.",
                    "Stone Wt.",
                    "Gross Wt.",
                    "Action",
                  ].map((head) => (
                    <th
                      key={head}
                      className="
whitespace-nowrap
px-3
py-3
text-[13px]
font-bold

lg:px-6
lg:text-[14px]

first:rounded-tl-[24px]
last:rounded-tr-[24px]
"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={10} className="h-[220px] bg-white">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-7 w-7 animate-spin text-[#111827]" />
                      </div>
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredRows.map((item) => {
                    const isOpen = openId === item.id;
                    const isChildLoading = childLoadingId === item.id;

                    return (
                      <Fragment key={item.id}>
                        <tr className="
h-[52px]
lg:h-[60px]

border-b
border-[#D7DEE8]
bg-white

text-[13px]
lg:text-[15px]

font-medium
transition
hover:bg-[#FAFCFF]
">
                          <td className="whitespace-nowrap px-6">
                            {item.category}
                          </td>
                          <td className="whitespace-nowrap border-l border-[#D7DEE8] px-6 text-center">
                            {item.code}
                          </td>
                          <td className="border-l border-[#D7DEE8] px-6 text-center">
                            {item.quantity}
                          </td>
                          <td className="whitespace-nowrap border-l border-[#D7DEE8] px-6 text-center font-bold">
                            {item.sellingPrice}
                          </td>
                          <td className="whitespace-nowrap border-l border-[#D7DEE8] px-6 text-center font-bold">
                            {item.makingCharge}
                          </td>
                          <td className="border-l border-[#D7DEE8] px-6 text-center">
                            {item.purity}
                          </td>
                          <td className="border-l border-[#D7DEE8] px-6 text-center">
                            {item.netWeight}
                          </td>
                          <td className="border-l border-[#D7DEE8] px-6 text-center">
                            {item.stoneWeight}
                          </td>
                          <td className="border-l border-[#D7DEE8] px-6 text-center">
                            {item.grossWeight}
                          </td>
                          <td className="whitespace-nowrap border-l border-[#D7DEE8] px-6 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggle(item)}
                              className={`inline-flex
items-center
gap-2
text-[13px]

lg:gap-3
lg:text-[15px] font-medium transition ${isOpen
                                  ? "text-[#111827]"
                                  : "text-[#5F6673] hover:text-[#111827]"
                                }`}
                            >
                              View Details
                              {isOpen ? (
                                <ChevronUp className="h-4 w-4 text-[#111827]" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-[#64748B]" />
                              )}
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <>
                            <tr className="h-11 lg:h-[54px] border-b border-[#D7DEE8] bg-[#EDF4FA] text-[15px] font-bold text-black">
                              <td className="px-6">Image</td>
                              <td className="border-l border-[#D7DEE8] px-6">
                                Article
                              </td>
                              <td className="border-l border-[#D7DEE8] px-6">
                                Code
                              </td>
                              <td className="border-l border-[#D7DEE8] px-6 text-center">
                                Quantity
                              </td>
                              <td className="border-l border-[#D7DEE8] px-6 text-center">
                                Purity
                              </td>
                              <td className="border-l border-[#D7DEE8] px-6 text-center">
                                Net Wt.
                              </td>
                              <td className="border-l border-[#D7DEE8] px-6 text-center">
                                Stone Wt.
                              </td>
                              <td className="border-l border-[#D7DEE8] px-6 text-center">
                                Gross Wt.
                              </td>
                              <td
                                colSpan={2}
                                className="border-l border-[#D7DEE8] px-6 text-center"
                              >
                                Status
                              </td>
                            </tr>

                            {isChildLoading && (
                              <tr>
                                <td
                                  colSpan={10}
                                  className="h-[90px] bg-[#F4F8FB]"
                                >
                                  <div className="flex items-center justify-center">
                                    <Loader2 className="h-5 w-5 animate-spin text-[#111827]" />
                                  </div>
                                </td>
                              </tr>
                            )}

                            {!isChildLoading &&
                              item.items.map((product) => (
                                <tr
                                  key={product.id}
                                  className="h-[64px] border-b border-[#D7DEE8] bg-[#F4F8FB] text-[15px] font-medium text-black transition hover:bg-[#EEF5FB]"
                                >
                                  <td className="px-6">
                                    <button
                                      type="button"
                                      onClick={() => setPreview(product)}
                                      className="
group
flex
h-9
w-[72px]

items-center
gap-2
rounded-lg
bg-[#F3D8E8]
px-2
transition

hover:bg-[#ECC6DB]

lg:h-[42px]
lg:w-[82px]
"
                                    >
                                      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
                                        {product.image ? (
                                          <img
                                            src={product.image}
                                            alt={product.article}
                                            className="h-full w-full object-cover transition group-hover:scale-110"
                                            onError={(event) => {
                                              event.currentTarget.style.display =
                                                "none";
                                            }}
                                          />
                                        ) : (
                                          <ImageIcon className="h-4 w-4 text-[#64748B]" />
                                        )}
                                      </span>
                                      <span className="text-[13px] font-semibold text-[#111827]">
                                        View
                                      </span>
                                    </button>
                                  </td>

                                  <td className="border-l border-[#D7DEE8] px-6">
                                    {product.article}
                                  </td>
                                  <td className="border-l border-[#D7DEE8] px-6">
                                    {product.code}
                                  </td>
                                  <td className="border-l border-[#D7DEE8] px-6 text-center">
                                    {product.quantity}
                                  </td>
                                  <td className="border-l border-[#D7DEE8] px-6 text-center">
                                    {product.purity}
                                  </td>
                                  <td className="border-l border-[#D7DEE8] px-6 text-center">
                                    {product.netWeight}
                                  </td>
                                  <td className="border-l border-[#D7DEE8] px-6 text-center">
                                    {product.stoneWeight}
                                  </td>
                                  <td className="border-l border-[#D7DEE8] px-6 text-center">
                                    {product.grossWeight}
                                  </td>
                                  <td
                                    colSpan={2}
                                    className="border-l border-[#D7DEE8] px-6"
                                  >
                                    <div className="flex items-center justify-center gap-3">

                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (!product.itemId) return;

                                          router.push(
                                            `/head-office/tracking/${product.itemId}`
                                          );
                                        }}
                                        className="
        inline-flex
        h-[34px]
        items-center
        justify-center
        rounded-full
        bg-[#111827]
        px-4
        text-[12px]
        font-semibold
        text-white
        transition
        hover:bg-[#1F2937]
        active:scale-[0.98]
      "
                                      >
                                        Track
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}

                            {!isChildLoading && item.items.length === 0 && (
                              <tr>
                                <td
                                  colSpan={10}
                                  className="h-[90px] bg-[#F4F8FB] text-center text-[14px] font-semibold text-[#64748B]"
                                >
                                  No items found in this category.
                                </td>
                              </tr>
                            )}
                          </>
                        )}
                      </Fragment>
                    );
                  })}

                {!loading && filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="h-[180px] bg-white text-center text-[15px] font-semibold text-[#64748B]"
                    >
                      No stock category found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {preview && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
          onMouseDown={() => setPreview(null)}
        >
          <div
            className="relative w-full max-w-[520px] overflow-hidden rounded-[28px] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.25)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <div>
                <h3 className="text-[19px] font-bold text-[#111827]">
                  {preview.article}
                </h3>
                <p className="text-[13px] font-medium text-[#64748B]">
                  Code: {preview.code}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F9] transition hover:bg-[#E2E8F0]"
              >
                <X className="h-5 w-5 text-[#111827]" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] p-5">
              <div className="flex h-[360px] items-center justify-center overflow-hidden rounded-[22px] border border-[#E5E7EB] bg-white">
                {preview.image ? (
                  <img
                    src={preview.image}
                    alt={preview.article}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-[#64748B]">
                    <ImageIcon className="h-10 w-10" />
                    <p className="mt-2 text-sm font-semibold">
                      Image not available
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <PreviewInfo label="Qty" value={preview.quantity} />
                <PreviewInfo label="Purity" value={preview.purity} />
                <PreviewInfo label="Net Wt." value={preview.netWeight} />
                <PreviewInfo label="Gross Wt." value={preview.grossWeight} />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function mapCategoryRow(item: ApiInventoryItem, index: number): CategoryRow {
  const category = item.category || "Unknown";

  return {
    id: makeId(category, index),
    category,
    code: item.code || "-",
    quantity: toNumber(item.quantity),
    sellingPrice: formatMoney(item.selling_price || item.sale_rate),
    makingCharge: formatMoney(item.making_charge),
    purity: item.purity || "-",
    netWeight: formatWeight(item.net_weight),
    stoneWeight: formatWeight(item.stone_weight),
    grossWeight: formatWeight(item.gross_weight),
    items: [],
  };
}

function mapStockItem(
  item: ApiInventoryItem,
  category: string,
  index: number
): StockItem {
  const code =
    item.code ||
    item.sku_code ||
    "-";

  return {
    id: makeId(
      `${category}-${code}`,
      index
    ),

    itemId: Number(
      item.item_id || 0
    ),

    image:
      item.image_url ||
      item.image ||
      "",

    article:
      item.item_name ||
      item.article ||
      category ||
      "Item",

    code,

    quantity: toNumber(
      item.quantity
    ),

    purity:
      item.purity || "-",

    netWeight: formatWeight(
      item.net_weight
    ),

    stoneWeight: formatWeight(
      item.stone_weight
    ),

    grossWeight: formatWeight(
      item.gross_weight
    ),
  };
}

function formatTitle(value?: string) {
  if (!value) return "District Store";

  if (value === "main-warehouse") return "Main Warehouse";

  return decodeURIComponent(value)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toNumber(value?: number | string) {
  return Number(value || 0);
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
  return `${Number.isInteger(amount) ? amount : amount.toFixed(2)}g`;
}

function makeId(value: string, index: number) {
  return `${value || "row"}-${index}`.toLowerCase().replace(/\s+/g, "-");
}

function PreviewInfo({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-[14px] border border-[#E5E7EB] bg-white px-3 py-3 text-center">
      <p className="text-[12px] font-semibold text-[#64748B]">{label}</p>
      <p className="mt-1 text-[15px] font-bold text-[#111827]">{value}</p>
    </div>
  );
}