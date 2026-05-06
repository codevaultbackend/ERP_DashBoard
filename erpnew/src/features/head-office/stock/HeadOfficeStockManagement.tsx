"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BadgeAlert,
  Box,
  ChevronDown,
  ChevronUp,
  Eye,
  MoveDownRight,
  Plus,
  Search,
  Truck,
  Upload,
} from "lucide-react";
import {
  getHeadOfficeItemsByCategory,
  getHeadOfficeStockDashboard,
  type HeadOfficeCategoryItem,
  type HeadOfficeDashboardTableItem,
} from "./api/head-office-stock-api";

type StockCards = {
  totalStocksItems: number;
  deadStockItems: number;
  lowStock: number;
  transitGoods: number;
};

type CategoryRow = {
  id: string;
  category: string;
  code: string;
  quantity: number;
  purchasePrice: string;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
  articles?: ArticleRow[];
};

type ArticleRow = {
  id: string;
  article: string;
  code: string;
  quantity: number;
  purchasePrice: string;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
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

const parentColumns = [
  { label: "Item", width: 150, align: "left" },
  { label: "Code", width: 122, align: "center" },
  { label: "Quantity", width: 112, align: "center" },
  { label: "Purchase Price", width: 162, align: "center" },
  { label: "Selling Price", width: 158, align: "center" },
  { label: "Making Chg.", width: 148, align: "center" },
  { label: "Purity", width: 120, align: "center" },
  { label: "Net Wt.", width: 136, align: "center" },
  { label: "Stone Wt.", width: 136, align: "center" },
  { label: "Gross Wt.", width: 136, align: "center" },
  { label: "Action", width: 130, align: "center" },
];

const childColumns = [
  { label: "Article", width: 220, align: "left" },
  { label: "Code", width: 240, align: "left" },
  { label: "Quantity", width: 112, align: "center" },
  { label: "Purchase Price", width: 160, align: "center" },
  { label: "Selling Price", width: 160, align: "center" },
  { label: "Making Chg.", width: 150, align: "center" },
  { label: "Purity", width: 120, align: "center" },
  { label: "Net Wt.", width: 132, align: "center" },
  { label: "Stone Wt.", width: 132, align: "center" },
  { label: "Gross Wt.", width: 132, align: "center" },
];

const parentMinWidth = parentColumns.reduce(
  (sum, column) => sum + column.width,
  0
);

const childMinWidth = childColumns.reduce(
  (sum, column) => sum + column.width,
  0
);

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function safeText(value: unknown, fallback = "--") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function formatCompactNumber(value: unknown, maxDecimals = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: maxDecimals,
  }).format(Number(num.toFixed(maxDecimals)));
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
      code: `${items.length} items`,
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

function mapCategoryItemsToArticleRows(rows: HeadOfficeCategoryItem[]) {
  return rows.map((row, index): ArticleRow => {
    const articleName = row.article || row.item || row.item_name || "Item";
    const code = row.code || row.article_code || row.sku_code || "--";

    return {
      id: String(row.id || code || `${articleName}-${index}`),
      article: safeText(articleName),
      code: safeText(code),
      quantity: toNumber(row.available_qty ?? row.quantity),
      purchasePrice: formatPrice(row.purchase_price ?? row.purchase_rate),
      sellingPrice: formatPrice(row.selling_price ?? row.sale_rate),
      makingCharge: formatPrice(row.making_charge),
      purity: safeText(row.purity),
      netWeight: formatWeight(row.net_weight),
      stoneWeight: formatWeight(row.stone_weight),
      grossWeight: formatWeight(row.gross_weight),
    };
  });
}

function TableText({
  children,
  center = false,
  bold = false,
  title,
}: {
  children: React.ReactNode;
  center?: boolean;
  bold?: boolean;
  title?: string;
}) {
  return (
    <div
      title={title || (typeof children === "string" ? children : undefined)}
      className={cn(
        "max-w-full truncate text-[15px] leading-[20px] tracking-[-0.02em] text-erp-text",
        center && "text-center",
        bold && "font-semibold"
      )}
    >
      {children}
    </div>
  );
}

function StockStatCards({ cards }: { cards: StockCards }) {
  const stats = [
    {
      id: "total",
      title: "Total Stocks Items",
      value: cards.totalStocksItems,
      tone: "gold",
      icon: "box",
      change: "+12.5%",
      changeTone: "green",
    },
    {
      id: "dead",
      title: "Dead Stock Items",
      value: cards.deadStockItems,
      tone: "red",
      icon: "badge",
      change: "+12.5%",
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.id}
          className="flex min-h-[153px]  flex-col justify-between rounded-erp-2xl border border-erp-border bg-erp-card px-[18px] py-[16px] !shadow-erp-card"
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
            <p className="text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-[#282828] mt-[22px]">
              {item.title}
            </p>

            <div className="mt-[6px] flex items-end justify-between gap-3">
              <h3 className="text-[28px] font-semibold leading-[28px] tracking-[-0.06em] text-black">
                {item.value}
              </h3>

              {item.change ? (
                <div
                  className={cn(
                    "mb-[6px] flex shrink-0 items-center gap-[4px] text-[15px] font-semibold leading-none tracking-[-0.02em]",
                    item.changeTone === "red"
                      ? "text-erp-danger"
                      : "text-erp-success"
                  )}
                >
                  <ArrowUpRight className="h-[16px] w-[16px] stroke-[2.2]" />
                  <span>{item.change}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StockToolbar({
  searchValue,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
}) {
  const [openCategory, setOpenCategory] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const closeDropdown = (event: MouseEvent) => {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target as Node)) {
        setOpenCategory(false);
      }
    };

    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <div className="rounded-[30px] border border-erp-border bg-erp-card px-[18px] py-[17px] shadow-erp-card">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-[540px] 2xl:max-w-[650px]">
          <Search className="pointer-events-none absolute left-[18px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8C96A6]" />

          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search inventory..."
            className="h-[40px] w-full rounded-erp-full border-0 bg-[#F4F4F5] pl-[50px] pr-4 text-[15px] font-normal leading-[20px] tracking-[-0.02em] text-erp-text outline-none transition placeholder:text-erp-placeholder focus:ring-2 focus:ring-erp-primary/10"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:flex-nowrap xl:items-center xl:justify-end">
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setOpenCategory((prev) => !prev)}
              className="flex h-[40px] min-w-[148px] items-center justify-between rounded-erp-full border border-erp-border bg-white px-[20px] text-[15px] font-medium leading-[20px] tracking-[-0.02em] text-[#111111] shadow-erp-sm transition hover:bg-erp-card-soft"
            >
              <span className="truncate">
                {selectedCategory === "All" ? "Category" : selectedCategory}
              </span>

              <ChevronDown
                className={cn(
                  "h-[18px] w-[18px] stroke-[2.2] transition-transform",
                  openCategory && "rotate-180"
                )}
              />
            </button>

            {openCategory && (
              <div className="absolute right-0 z-30 mt-2 max-h-[280px] w-[220px] overflow-y-auto rounded-erp-md border border-erp-border bg-white shadow-erp-card">
                {categories.map((category) => {
                  const active = category === selectedCategory;

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        onCategoryChange(category);
                        setOpenCategory(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-start px-4 py-3 text-left text-[14px] font-medium leading-[18px] tracking-[-0.02em] transition",
                        active
                          ? "bg-erp-dark text-white"
                          : "bg-white text-erp-text hover:bg-erp-card-soft"
                      )}
                    >
                      {category === "All" ? "Category" : category}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StockTable({
  rows,
  loading,
  searchValue,
  selectedCategory,
  loadingCategory,
  onLoadArticles,
}: {
  rows: CategoryRow[];
  loading: boolean;
  searchValue: string;
  selectedCategory: string;
  loadingCategory: string | null;
  onLoadArticles: (category: string) => Promise<void>;
}) {
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [parentViewportWidth, setParentViewportWidth] = useState(0);

  const parentScrollRef = useRef<HTMLDivElement | null>(null);
  const childScrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const dragState = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    activeEl: null as HTMLDivElement | null,
    hasMoved: false,
  });

  useEffect(() => {
    const element = parentScrollRef.current;
    if (!element) return;

    const updateWidth = () => setParentViewportWidth(element.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    window.addEventListener("resize", updateWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return rows.filter((row) => {
      const categoryMatch =
        selectedCategory === "All" || row.category === selectedCategory;

      if (!categoryMatch) return false;
      if (!query) return true;

      return (
        row.category.toLowerCase().includes(query) ||
        row.code.toLowerCase().includes(query) ||
        row.purity.toLowerCase().includes(query) ||
        row.articles?.some(
          (article) =>
            article.article.toLowerCase().includes(query) ||
            article.code.toLowerCase().includes(query) ||
            article.purity.toLowerCase().includes(query)
        )
      );
    });
  }, [rows, searchValue, selectedCategory]);

  const startDrag = (
    event: React.MouseEvent<HTMLDivElement>,
    element: HTMLDivElement | null
  ) => {
    if (!element) return;

    const target = event.target as HTMLElement;

    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea")
    ) {
      return;
    }

    event.stopPropagation();

    dragState.current = {
      isDown: true,
      startX: event.clientX,
      scrollLeft: element.scrollLeft,
      activeEl: element,
      hasMoved: false,
    };

    element.classList.add("cursor-grabbing");
    element.classList.remove("cursor-grab");
  };

  const moveDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    const state = dragState.current;
    const element = state.activeEl;

    if (!state.isDown || !element) return;

    event.preventDefault();
    event.stopPropagation();

    const walk = event.clientX - state.startX;

    if (Math.abs(walk) > 4) {
      dragState.current.hasMoved = true;
    }

    element.scrollLeft = state.scrollLeft - walk;
  };

  const stopDrag = (event?: React.MouseEvent<HTMLDivElement>) => {
    event?.stopPropagation();

    const element = dragState.current.activeEl;

    if (element) {
      element.classList.remove("cursor-grabbing");
      element.classList.add("cursor-grab");
    }

    setTimeout(() => {
      dragState.current = {
        isDown: false,
        startX: 0,
        scrollLeft: 0,
        activeEl: null,
        hasMoved: false,
      };
    }, 0);
  };

  const handleView = async (row: CategoryRow) => {
    if (dragState.current.hasMoved) return;

    const shouldOpen = openRowId !== row.id;
    setOpenRowId(shouldOpen ? row.id : null);

    if (shouldOpen && !row.articles?.length) {
      await onLoadArticles(row.category);
    }
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-[30px] border border-erp-border bg-erp-card shadow-erp-card">
        <div className="p-6">
          <div className="h-[360px] animate-pulse rounded-erp-lg bg-erp-border-soft" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[30px] border border-erp-border bg-erp-card shadow-erp-card">
      <div
        ref={parentScrollRef}
        className="table-drag-scroll max-w-full cursor-grab overflow-x-auto select-none active:cursor-grabbing"
        onMouseDown={(event) => startDrag(event, parentScrollRef.current)}
        onMouseMove={moveDrag}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
      >
        <table
          className="w-full table-fixed border-separate border-spacing-0"
          style={{ minWidth: `${parentMinWidth}px` }}
        >
          <colgroup>
            {parentColumns.map((column) => (
              <col
                key={column.label}
                style={{
                  width: `${column.width}px`,
                  minWidth: `${column.width}px`,
                }}
              />
            ))}
          </colgroup>

          <thead>
            <tr className="bg-black">
              {parentColumns.map((column, index) => (
                <th
                  key={column.label}
                  className={cn(
                    "h-[56px] border-r border-black px-5 text-[15px] font-semibold leading-none text-white whitespace-nowrap",
                    column.align === "center" ? "text-center" : "text-left",
                    index === 0 && "rounded-tl-[30px]",
                    index === parentColumns.length - 1 &&
                      "rounded-tr-[30px] border-r-0"
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row) => {
              const isOpen = openRowId === row.id;
              const isRowLoading = loadingCategory === row.category;

              return (
                <Fragment key={row.id}>
                  <tr className="bg-white transition hover:bg-erp-card-soft">
                    {[
                      row.category,
                      row.code,
                      formatCompactNumber(row.quantity, 0),
                      row.purchasePrice,
                      row.sellingPrice,
                      row.makingCharge,
                      row.purity,
                      row.netWeight,
                      row.stoneWeight,
                      row.grossWeight,
                    ].map((value, index) => (
                      <td
                        key={`${row.id}-${index}`}
                        className="h-[58px] border-b border-r border-erp-border px-5"
                      >
                        <TableText
                          center={index !== 0}
                          bold={index === 0 || index >= 3}
                          title={String(value)}
                        >
                          {value}
                        </TableText>
                      </td>
                    ))}

                    <td className="h-[58px] border-b border-erp-border px-5">
                      <div className="flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleView(row)}
                          className={cn(
                            "inline-flex h-[34px] items-center justify-center gap-1 rounded-erp-full border px-3 text-[13px] font-semibold leading-none transition",
                            isOpen
                              ? "border-erp-primary bg-erp-primary-soft text-erp-primary"
                              : "border-erp-border bg-white text-erp-primary hover:bg-erp-primary-soft"
                          )}
                        >
                          <Eye size={15} strokeWidth={2.2} />
                          <span>View</span>
                          {isOpen ? (
                            <ChevronUp size={14} strokeWidth={2.4} />
                          ) : (
                            <ChevronDown size={14} strokeWidth={2.4} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr>
                      <td colSpan={11} className="bg-erp-bg p-0">
                        <div
                          className="sticky left-0 z-[2] bg-erp-bg px-3 py-4 sm:px-5"
                          style={{
                            width: parentViewportWidth
                              ? `${parentViewportWidth}px`
                              : "100%",
                            maxWidth: parentViewportWidth
                              ? `${parentViewportWidth}px`
                              : "100%",
                          }}
                        >
                          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h4 className="text-[15px] font-semibold tracking-[-0.02em] text-erp-heading">
                                {row.category} Items
                              </h4>
                              <p className="mt-1 text-[13px] font-medium text-erp-muted">
                                Hold and drag horizontally to scroll item list
                              </p>
                            </div>

                            <span className="w-fit rounded-erp-full bg-white px-3 py-1 text-[12px] font-semibold text-erp-primary shadow-erp-sm">
                              {row.articles?.length || 0} items
                            </span>
                          </div>

                          {isRowLoading ? (
                            <div className="rounded-erp-md bg-white px-6 py-8 text-center text-[14px] font-medium text-erp-muted">
                              Loading category items...
                            </div>
                          ) : row.articles?.length ? (
                            <div
                              ref={(el) => {
                                childScrollRefs.current[row.id] = el;
                              }}
                              className="table-drag-scroll w-full max-w-full cursor-grab overflow-x-auto rounded-erp-lg border border-erp-border bg-white select-none active:cursor-grabbing"
                              onMouseDown={(event) =>
                                startDrag(
                                  event,
                                  childScrollRefs.current[row.id]
                                )
                              }
                              onMouseMove={moveDrag}
                              onMouseUp={stopDrag}
                              onMouseLeave={stopDrag}
                            >
                              <table
                                className="table-fixed border-separate border-spacing-0"
                                style={{
                                  width: `${childMinWidth}px`,
                                  minWidth: `${childMinWidth}px`,
                                }}
                              >
                                <colgroup>
                                  {childColumns.map((column) => (
                                    <col
                                      key={column.label}
                                      style={{
                                        width: `${column.width}px`,
                                        minWidth: `${column.width}px`,
                                      }}
                                    />
                                  ))}
                                </colgroup>

                                <thead>
                                  <tr className="bg-[#EEF3F7]">
                                    {childColumns.map((column, index) => (
                                      <th
                                        key={column.label}
                                        className={cn(
                                          "h-[48px] border-b border-r border-erp-border px-5 text-[14px] font-semibold text-erp-text whitespace-nowrap",
                                          column.align === "center"
                                            ? "text-center"
                                            : "text-left",
                                          index === childColumns.length - 1 &&
                                            "border-r-0"
                                        )}
                                      >
                                        {column.label}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>

                                <tbody>
                                  {row.articles.map((article) => {
                                    const values = [
                                      article.article,
                                      article.code,
                                      formatCompactNumber(article.quantity, 0),
                                      article.purchasePrice,
                                      article.sellingPrice,
                                      article.makingCharge,
                                      article.purity,
                                      article.netWeight,
                                      article.stoneWeight,
                                      article.grossWeight,
                                    ];

                                    return (
                                      <tr
                                        key={article.id}
                                        className="bg-white transition hover:bg-erp-card-soft"
                                      >
                                        {values.map((value, index) => (
                                          <td
                                            key={`${article.id}-${index}`}
                                            className={cn(
                                              "h-[54px] border-b border-erp-border px-5",
                                              index !== values.length - 1 &&
                                                "border-r"
                                            )}
                                          >
                                            <TableText
                                              center={index >= 2}
                                              bold={
                                                index === 0 ||
                                                (index >= 3 && index <= 5)
                                              }
                                              title={String(value)}
                                            >
                                              {value}
                                            </TableText>
                                          </td>
                                        ))}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="rounded-erp-md bg-white px-6 py-8 text-center text-[14px] font-medium text-erp-muted">
                              No category items found.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}

            {filteredRows.length === 0 && (
              <tr>
                <td
                  colSpan={11}
                  className="px-6 py-10 text-center text-[15px] font-medium text-erp-muted"
                >
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

  const categories = useMemo(() => {
    return ["All", ...rows.map((row) => row.category)];
  }, [rows]);

  const fetchDashboard = async () => {
    setLoading(true);

    try {
      const response = await getHeadOfficeStockDashboard();

      const apiCards = response.data?.cards;
      const apiTable = response.data?.table || [];

      setCards({
        totalStocksItems: Number(apiCards?.totalStocksItems || 0),
        deadStockItems: Number(apiCards?.deadStockItems || 0),
        lowStock: Number(apiCards?.lowStock || 0),
        transitGoods: Number(apiCards?.transitGoods || 0),
      });

      setRows(mapDashboardRowsToCategoryRows(apiTable));
    } catch (error) {
      console.error("Head office stock dashboard error:", error);

      setCards({
        totalStocksItems: 0,
        deadStockItems: 0,
        lowStock: 0,
        transitGoods: 0,
      });

      setRows([]);
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
    fetchDashboard();
  }, []);

  return (
    <div className="w-full max-w-full space-y-4 overflow-hidden">
      <StockStatCards cards={cards} />

      <StockToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <StockTable
        rows={rows}
        loading={loading}
        searchValue={searchValue}
        selectedCategory={selectedCategory}
        loadingCategory={loadingCategory}
        onLoadArticles={loadArticles}
      />
    </div>
  );
}