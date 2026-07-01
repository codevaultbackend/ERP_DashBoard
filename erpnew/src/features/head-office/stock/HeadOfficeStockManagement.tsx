"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DistrictAddStockPopup from "@/features/district/stock/component/DistrictAddStockPopup";
import type { CategoryRow, ArticleRow } from "./types";
import {
  ArrowUpRight,
  BadgeAlert,
  Box,
  ChevronDown,
  ChevronUp,
  Eye,
  MoveDownRight,
  Pencil,
  Plus,
  Search,
  Truck,
  Upload,
  UploadCloud,
} from "lucide-react";
import {
  getHeadOfficeItemsByCategory,
  getHeadOfficeStockDashboard,
  type HeadOfficeCategoryItem,
  type HeadOfficeDashboardTableItem,
  type HeadOfficeInventoryItem,
} from "./api/head-office-stock-api";
import {
  addStockItem,
  uploadStockInFile,
  getStockApiErrorMessage,
} from "../../retail/StockManagement/api/stock-management-api";
import EditStockPricingModal, {
  type EditableStockPricingItem,
} from "./pricing/EditStockPricingModal";
import {
  getOrganizationsByLevel,
  type Organization,
} from "@/features/head-office/staff-management/api/staff-management-api";
import { DistrictRetailStoreApi, DistrictStoreApi } from "../request/request/api/district-request-api";
import { AddStockFormPayload } from "@/features/retail/StockManagement/components/AddStockPopup";
import StockTable from "./components/StockTable";

type StockCards = {
  totalStocksItems: number;
  deadStockItems: number;
  lowStock: number;
  transitGoods: number;
};


const CATEGORY_KEYWORDS = [
  "Nose Pin",
  "Earrings",
  "Earring",
  "Necklace",
  "Pendant",
  "Bracelet",
  "Bangles",
  "Bangle",
  "Anklet",
  "Payal",
  "Ring",
  "Chain",
  "Watch",
  "Coin",
];

function formatCompactNumber(value: unknown, maxDecimals = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: maxDecimals,
  }).format(Number(num.toFixed(maxDecimals)));
}

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function safeText(value: unknown, fallback = "--") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}



function formatPrice(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatWeight(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0g";

  return `${formatCompactNumber(num, 2)}g`;
}
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
function normalizeCategoryName(name: string) {
  const cleanName = safeText(name, "Others").trim();

  const matched = CATEGORY_KEYWORDS.find((keyword) =>
    cleanName.toLowerCase().includes(keyword.toLowerCase())
  );

  if (!matched) return cleanName || "Others";
  if (matched === "Bangles") return "Bangle";
  if (matched === "Earring") return "Earrings";
  if (matched === "Payal") return "Anklet";

  return matched;
}

function getCommonValue<T>(
  items: T[],
  getter: (item: T) => unknown,
  fallback = "0"
) {
  const values = items
    .map(getter)
    .filter((value) => value !== null && value !== undefined && value !== "");

  if (!values.length) return fallback;

  const first = String(values[0]);
  const allSame = values.every((value) => String(value) === first);

  return allSame ? first : "Mixed";
}

function mapDashboardRowsToCategoryRows(
  rows: HeadOfficeDashboardTableItem[]
): CategoryRow[] {
  const grouped = new Map<string, HeadOfficeDashboardTableItem[]>();

  rows.forEach((row) => {
    const category = normalizeCategoryName(safeText(row.item, "Others"));
    grouped.set(category, [...(grouped.get(category) || []), row]);
  });

  return Array.from(grouped.entries()).map(([category, items], index) => {
    const purchaseRate = getCommonValue(items, (item) => item.purchase_rate);
    const sellingPrice = getCommonValue(items, (item) => item.selling_price);
    const makingCharge = getCommonValue(items, (item) => item.making_charge);
    const purity = getCommonValue(items, (item) => item.purity, "--");

    return {
      id: `${category}-${index}`,
      category,
      quantity: items.reduce((sum, item) => sum + toNumber(item.quantity), 0),
      purchasePrice:
        purchaseRate === "Mixed" ? "Mixed" : formatPrice(purchaseRate),
      sellingPrice:
        sellingPrice === "Mixed" ? "Mixed" : formatPrice(sellingPrice),
      makingCharge:
        makingCharge === "Mixed" ? "Mixed" : formatPrice(makingCharge),
      purity,
      netWeight: formatWeight(
        items.reduce((sum, item) => sum + toNumber(item.net_weight), 0)
      ),
      stoneWeight: formatWeight(
        items.reduce((sum, item) => sum + toNumber(item.stone_weight), 0)
      ),
      grossWeight: formatWeight(
        items.reduce((sum, item) => sum + toNumber(item.gross_weight), 0)
      ),
      articles: [],
    };
  });
}

function mapHeadOfficeResponse(
  rows: HeadOfficeInventoryItem[]
): CategoryRow[] {
  const grouped = new Map<string, HeadOfficeInventoryItem[]>();

  rows.forEach((row) => {
    const category = normalizeCategoryName(
      safeText(row.category || row.item_name, "Others")
    );

    grouped.set(category, [...(grouped.get(category) || []), row]);
  });

  return Array.from(grouped.entries()).map(([category, items], index) => ({
    id: `${category}-${index}`,
    category,

    quantity: items.reduce(
      (sum, item) => sum + Number(item.available_qty ?? item.quantity ?? 0),
      0
    ),

    purchasePrice: "--",

    sellingPrice: formatPrice(items[0]?.selling_price),

    makingCharge: formatPrice(items[0]?.making_charge),

    purity: items[0]?.purity ?? "--",

    netWeight: formatWeight(
      items.reduce((sum, item) => sum + Number(item.net_weight ?? 0), 0)
    ),

    stoneWeight: formatWeight(
      items.reduce((sum, item) => sum + Number(item.stone_weight ?? 0), 0)
    ),

    grossWeight: formatWeight(
      items.reduce((sum, item) => sum + Number(item.gross_weight ?? 0), 0)
    ),

    articles: [],
  }));
}

function getStrictNumericId(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;

    const raw = String(value).trim();

    // SKU-DIST-7-... reject hoga
    if (!/^\d+$/.test(raw)) continue;

    const id = Number(raw);

    if (Number.isSafeInteger(id) && id > 0) {
      return id;
    }
  }

  return null;
}

function mapCategoryItemsToArticleRows(rows: HeadOfficeCategoryItem[]) {
  return rows.map((row, index): ArticleRow => {
    const articleName = row.article || row.item || row.item_name || "Item";
    const code = row.code || row.article_code || row.sku_code || "--";

    /**
     * IMPORTANT:
     * Backend ko numeric DB item id chahiye.
     * SKU/code ko item_id mat banao.
     */
    const numericItemId = getStrictNumericId(
      row.item_id,
      row.itemId,
      row.id,
      row.raw?.item_id,
      row.raw?.id,
      row.Item?.id,
      row.itemData?.id,
      row.item?.id
    );

    return {
      /**
       * React row key ke liye safe fallback okay hai.
       * But backend item_id ke liye SKU fallback nahi karna.
       */
      id: numericItemId ? String(numericItemId) : `missing-db-id-${code}-${index}`,
      image: row.image ?? null,
      image_url: row.image_url ?? row.image ?? null,

      /**
       * Modal/backend ke liye ye required hai.
       */
      item_id: numericItemId || "",
      itemId: numericItemId || "",

      article: safeText(articleName),
      item_name: safeText(articleName),
      name: safeText(articleName),

      code: safeText(code),
      sku_code: row.sku_code || null,
      article_code: row.article_code || row.code || code,

      quantity: toNumber(row.available_qty ?? row.quantity),

      purchasePrice: formatPrice(row.purchase_price ?? row.purchase_rate),
      sellingPrice: formatPrice(row.selling_price ?? row.sale_rate),
      makingCharge: formatPrice(row.making_charge),

      purchase_price: row.purchase_price ?? row.purchase_rate,
      purchase_rate: row.purchase_price ?? row.purchase_rate,

      selling_price: row.selling_price ?? row.sale_rate,
      sale_rate: row.selling_price ?? row.sale_rate,

      making_charge: row.making_charge,

      purity: safeText(row.purity),
      netWeight: formatWeight(row.net_weight),
      stoneWeight: formatWeight(row.stone_weight),
      grossWeight: formatWeight(row.gross_weight),

      net_weight: row.net_weight,
      stone_weight: row.stone_weight,
      gross_weight: row.gross_weight,

      raw: row,
    };
  });
}


function StockStatCards({ cards }: { cards: StockCards }) {
  const stats = [
    {
      id: "total",
      title: "Total Stocks Items",
      value: cards.totalStocksItems,
      tone: "gold",
      icon: "box",
      changeTone: "green",
    },
    {
      id: "dead",
      title: "Dead Stock Items",
      value: cards.deadStockItems,
      tone: "red",
      icon: "badge",
      changeTone: "red",
    },
    {
      id: "low",
      title: "Low Stock",
      value: cards.lowStock,
      tone: "warning",
      icon: "arrow",
    },
    {
      id: "transit",
      title: "Transit Goods",
      value: cards.transitGoods,
      tone: "purple",
      icon: "truck",
    },
  ];

  const toneClass = (tone: string) => {
    if (tone === "gold") return "bg-erp-yellow-soft text-erp-yellow";
    if (tone === "red") return "bg-erp-danger-soft text-erp-danger";
    if (tone === "warning") return "bg-erp-warning-soft text-erp-warning";
    if (tone === "purple") return "bg-erp-purple-soft text-erp-purple";
    return "bg-erp-card-soft text-erp-text";
  };

  const getIcon = (icon: string, className: string) => {
    if (icon === "badge") return <BadgeAlert className={className} />;
    if (icon === "arrow") return <MoveDownRight className={className} />;
    if (icon === "truck") return <Truck className={className} />;
    return <Box className={className} />;
  };

  return (
    <div className="grid grid-cols-1 gap-4 max-[768px]:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.id}
          className="flex max-h-[153px] flex-col justify-between rounded-erp-2xl border border-erp-border bg-erp-card px-[18px] py-[16px] shadow-erp-card"
        >
          <div
            className={cn(
              "flex h-[50px] w-[50px] items-center justify-center rounded-[18px]",
              toneClass(item.tone)
            )}
          >
            {getIcon(item.icon, "h-[22px] w-[22px] stroke-[1.85]")}
          </div>

          <div>
            <p className="mt-[22px] text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-[#282828]">
              {item.title}
            </p>

            <div className="mt-[6px] flex items-end justify-between gap-3">
              <h3 className="text-[28px] font-semibold leading-[28px] tracking-[-0.06em] text-black">
                {item.value}
              </h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}


function StockToolBar({
  searchValue,
  onSearchChange,

  categories,
  selectedCategory,
  onCategoryChange,

  districtStores,
  selectedDistrict,
  onDistrictChange,

  retailStores,
  selectedRetailStore,
  onRetailStoreChange,

  onAddStock,
  onUploadStock,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;

  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;

  districtStores: DistrictStoreApi[];
  selectedDistrict: string;
  onDistrictChange: (value: string) => void;
  retailStores: DistrictRetailStoreApi[];
  selectedRetailStore: string;
  onRetailStoreChange: (value: string) => void;

  onAddStock: () => void;
  onUploadStock: (file: File) => void;
}) {
  const [openCategory, setOpenCategory] = useState(false);
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openRetail, setOpenRetail] = useState(false);

  const categoryRef = useRef<HTMLDivElement | null>(null);
  const districtRef = useRef<HTMLDivElement | null>(null);
  const retailRef = useRef<HTMLDivElement | null>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setOpenCategory(false);
      }

      if (
        districtRef.current &&
        !districtRef.current.contains(event.target as Node)
      ) {
        setOpenDistrict(false);
      }

      if (
        retailRef.current &&
        !retailRef.current.contains(event.target as Node)
      ) {
        setOpenRetail(false);
      }
    };

    document.addEventListener("mousedown", close);

    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="rounded-[30px] border border-erp-border bg-erp-card px-[18px] py-[17px] shadow-erp-card">
      <div className="flex flex-col gap-5">
        {/* First Row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Search */}
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search inventory..."
              className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-12 pr-4 text-[15px] outline-none focus:border-black"
            />
          </div>

          {/* Right Side Buttons */}
          <div className="flex flex-col gap-3 lg:w-[220px]">
            <button
              onClick={() => uploadRef.current?.click()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              <UploadCloud size={18} />
              Upload Stock
            </button>



            <input
              ref={uploadRef}
              type="file"
              hidden
              accept=".xlsx,.xls,.csv,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  onUploadStock(file);
                }

                e.currentTarget.value = "";
              }}
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
            <div ref={districtRef} className="relative">
              <button
                type="button"
                onClick={() => setOpenDistrict((v) => !v)}
                className="flex h-[40px] w-full min-w-[180px] sm:w-[180px] items-center justify-between rounded-full border border-erp-border bg-white px-5 shadow-erp-sm"
              >
                <span className="truncate">
                  {selectedDistrict === "head_office"
                    ? "Head Office Stock"
                    : districtStores.find(
                      (x) => String(x.id) === selectedDistrict
                    )?.store_name ?? "District"}
                </span>

                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition",
                    openDistrict && "rotate-180"
                  )}
                />
              </button>

              {openDistrict && (
                <div className="absolute left-0 top-full z-30 mt-2 w-[260px] rounded-2xl border border-erp-border bg-white shadow-lg">
                  <div className="max-h-64 overflow-y-auto py-1">
                    <button
                      onClick={() => {
                        onDistrictChange("own");
                        onRetailStoreChange("own");
                        setOpenDistrict(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100"
                    >
                      Head Office Stock
                    </button>

                    {districtStores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => {
                          onDistrictChange(String(store.id));
                          onRetailStoreChange("own");
                          setOpenDistrict(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100"
                      >
                        {store.store_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Retail Filter */}
            <div ref={retailRef} className="relative">
              <button
                type="button"
                disabled={selectedDistrict === "own"}
                onClick={() => {
                  if (selectedDistrict === "own") return;
                  setOpenRetail((v) => !v);
                }}
                className={cn(
                  "flex h-[40px] w-full min-w-[180px] sm:w-[180px] items-center justify-between rounded-full border px-5 shadow-erp-sm",
                  selectedDistrict === "head_office"
                    ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                    : "border-erp-border bg-white text-gray-900"
                )}
              >
                <span className="truncate">
                  {selectedDistrict === "own"
                    ? "Select District First"
                    : selectedRetailStore === "own"
                      ? "Retail Store"
                      : retailStores.find(
                        (x) => String(x.id) === selectedRetailStore
                      )?.store_name ?? "Retail Store"}
                </span>

                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition",
                    openRetail && "rotate-180"
                  )}
                />
              </button>

              {openRetail && (
                <div className="absolute left-0 top-full z-30 mt-2 w-[280px] rounded-2xl bg-white shadow-lg">
                  <div className="max-h-72 overflow-y-auto py-2">
                    <button
                      onClick={() => {
                        onRetailStoreChange("own");
                        setOpenRetail(false);
                      }}
                      className="flex h-12 w-full items-center px-5 text-left hover:bg-gray-100"
                    >
                      Head Office
                    </button>

                    {retailStores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => {
                          onRetailStoreChange(String(store.id));
                          setOpenRetail(false);
                        }}
                        className="flex h-12 w-full items-center px-5 text-left hover:bg-gray-100"
                      >
                        {store.store_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Category Filter */}
            <div className="">
              <div ref={categoryRef} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenCategory((prev) => !prev)}
                  className="flex h-[40px] min-w-[160px] items-center justify-between rounded-full border border-erp-border bg-white px-5 shadow-erp-sm"
                >
                  <span className="truncate">
                    {selectedCategory === "All"
                      ? "Category"
                      : selectedCategory}
                  </span>

                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition",
                      openCategory && "rotate-180"
                    )}
                  />
                </button>

                {openCategory && (
                  <div className="absolute left-0 z-30 mt-2 max-h-[280px] w-[220px] overflow-y-auto rounded-2xl border border-erp-border bg-white shadow-lg">
                    {categories.map((category) => {
                      const active = category === selectedCategory;

                      return (
                        <button
                          key={category}
                          onClick={() => {
                            onCategoryChange(category);
                            setOpenCategory(false);
                          }}
                          className={cn(
                            "w-full px-4 py-3 text-left transition",
                            active
                              ? "bg-black text-white"
                              : "hover:bg-gray-100"
                          )}
                        >
                          {category === "All"
                            ? "Category"
                            : category}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className=""></div>
          </div>
          <div className=""><button
            onClick={onAddStock}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:bg-gray-900 whitespace-nowrap"
          >
            <Plus size={18} />
            Add Stock
          </button></div>

        </div>
      </div>
    </div>
  );
}

export default function HeadOfficeStockManagement() {
  const [cards, setCards] = useState<StockCards>({
    totalStocksItems: 0,
    deadStockItems: 0,
    lowStock: 0,
    transitGoods: 0,
  });

  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("head_office");
  const [selectedRetailStore, setSelectedRetailStore] = useState("head_office");
  const [districtStores, setDistrictStores] = useState<Organization[]>([]);
  const [retailStores, setRetailStores] = useState<Organization[]>([]);
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [addStockLoading, setAddStockLoading] = useState(false);
  const [addStockError, setAddStockError] = useState("");
  const [uploadStockLoading, setUploadStockLoading] = useState(false);

  const [uploadStockError, setUploadStockError] = useState("");


  const filteredRetailStores = useMemo(() => {
    if (selectedDistrict === "own") return [];

    return retailStores.filter(
      (store) =>
        String(store.parent_id) === selectedDistrict ||
        String(store.district_id) === selectedDistrict
    );
  }, [selectedDistrict, retailStores]);

  const categories = useMemo(() => {
    return ["All", ...rows.map((row) => row.category)];
  }, [rows]);
  const loadStores = async () => {
    try {
      const [districts, retails] = await Promise.all([
        getOrganizationsByLevel("district"),
        getOrganizationsByLevel("retail"),
      ]);

      setDistrictStores(districts);
      setRetailStores(retails);
    } catch (err) {
      console.error("Failed to load organizations", err);
    }
  };

  const handleAddStockSubmit = async (payload: AddStockFormPayload[]) => {
    try {
      setAddStockLoading(true);
      setAddStockError("");

      for (const item of payload) {
        const result = await addStockItem(item);

        if (!result?.success) {
          throw new Error(
            result?.message || "Failed to add stock item"
          );
        }
      }

      setAddStockOpen(false);
      setAddStockError("");

      await fetchDashboard();
    } catch (err) {
      setAddStockError(getStockApiErrorMessage(err));
    } finally {
      setAddStockLoading(false);
    }
  };
  const handleUploadStockFile = async (file: File) => {
    try {
      if (uploadStockLoading) return;

      setUploadStockLoading(true);
      setUploadStockError("");

      const allowedExtensions = [".xlsx", ".xls", ".csv", ".pdf"];

      const fileName = file.name.toLowerCase();

      const isAllowed = allowedExtensions.some((ext) =>
        fileName.endsWith(ext)
      );

      if (!isAllowed) {
        throw new Error(
          "Only Excel, CSV, or PDF files are allowed."
        );
      }

      const maxSize = 15 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "File size should be less than 15MB."
        );
      }

      const result = await uploadStockInFile(file);

      if (!result?.success) {
        throw new Error(
          result?.message ||
          "Failed to upload stock file"
        );
      }

      await fetchDashboard();

      alert(result.message || "Stock uploaded successfully");
    } catch (error) {
      const message = getStockApiErrorMessage(error);

      setUploadStockError(message);

      alert(message);
    } finally {
      setUploadStockLoading(false);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);

    try {
      let storeCode: string | undefined;

      // Retail selected
      if (selectedRetailStore !== "own") {
        const retail = retailStores.find(
          (x) => String(x.id) === selectedRetailStore
        );

        storeCode = retail?.store_code;
      }

      // District selected
      else if (selectedDistrict !== "own") {
        const district = districtStores.find(
          (x) => String(x.id) === selectedDistrict
        );

        storeCode = district?.store_code;
      }

      // Head Office
      else {
        storeCode = undefined;
      }

      let response;

      if (selectedDistrict === "own" && selectedRetailStore === "own") {
        // Head Office Stock
        response = await getHeadOfficeStockDashboard(
          undefined,
          true
        );
      }
      else {
        // District / Retail
        response = await getHeadOfficeStockDashboard(
          storeCode
        );
      }

      // Own Head Office API
      if (response.summary) {
        setCards({
          totalStocksItems: response.summary.total_stock_items,
          deadStockItems: response.summary.dead_stock_items,
          lowStock: response.summary.low_stock_items,
          transitGoods: response.summary.transit_goods,
        });

        setRows(mapHeadOfficeResponse(response.data));
      }

      // Old dashboard response (district / retail)
      else {
        setCards({
          totalStocksItems:
            Number(response.data?.cards?.totalStocksItems ?? 0),
          deadStockItems:
            Number(response.data?.cards?.deadStockItems ?? 0),
          lowStock:
            Number(response.data?.cards?.lowStock ?? 0),
          transitGoods:
            Number(response.data?.cards?.transitGoods ?? 0),
        });

        setRows(
          mapDashboardRowsToCategoryRows(
            response.data?.table ?? []
          )
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async (category: string) => {
    setLoadingCategory(category);

    try {
      const response = await getHeadOfficeItemsByCategory(category);
      const articles = mapCategoryItemsToArticleRows(response.data || []);

      setRows((prev) =>
        prev.map((row) =>
          row.category === category ? { ...row, articles } : row
        )
      );
    } catch (error) {
      console.error("Head office category items error:", error);

      setRows((prev) =>
        prev.map((row) =>
          row.category === category ? { ...row, articles: [] } : row
        )
      );
    } finally {
      setLoadingCategory(null);
    }
  };



  useEffect(() => {
    loadStores();
  }, []);


  useEffect(() => {
    if (districtStores.length || selectedDistrict === "own") {
      fetchDashboard();
    }
  }, [
    selectedDistrict,
    selectedRetailStore,
    districtStores,
    retailStores,
  ]);

  return (
    <div className="relative w-full max-w-full space-y-4 overflow-visible">
      <StockStatCards cards={cards} />

      <div className="relative !z-[50]">
        <StockToolBar
          searchValue={searchValue}
          onSearchChange={setSearchValue}

          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}

          districtStores={districtStores}
          selectedDistrict={selectedDistrict}
          onDistrictChange={setSelectedDistrict}

          retailStores={filteredRetailStores}

          selectedRetailStore={selectedRetailStore}
          onRetailStoreChange={setSelectedRetailStore}


          onAddStock={() => {
            setAddStockError("");
            setAddStockOpen(true);
          }}

          onUploadStock={handleUploadStockFile}
        />
      </div>

      <DistrictAddStockPopup
        open={addStockOpen}
        loading={addStockLoading}
        error={addStockError}
        onClose={() => {
          if (addStockLoading) return;
          setAddStockOpen(false);
          setAddStockError("");
        }}
        onSubmit={handleAddStockSubmit}
      />

      <div className="relative z-40">

        <StockTable
          rows={rows}
          loading={loading}
          searchValue={searchValue}
          selectedCategory={selectedCategory}
          loadingCategory={loadingCategory}
          onLoadArticles={loadArticles}
          onPricingUpdated={fetchDashboard}
        />
      </div>
    </div>
  );
}