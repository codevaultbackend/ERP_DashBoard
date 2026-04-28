"use client";

import Image from "next/image";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, X } from "lucide-react";
import { stockRows } from "../../data/stock-management-data";

type StockArticle = {
  id: string;
  image: string;
  article: string;
  code: string;
  quantity: number;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
};

type StockRow = {
  id: number | string;
  category: string;
  code: string;
  quantity: number;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
  image: string;
  articles?: StockArticle[];
};

type StockManagementTableProps = {
  rows?: StockRow[];
  loading?: boolean;
  loadingRowCategory?: string | null;
  selectedArticles: Record<string, boolean>;
  reportedArticles: Record<string, boolean>;
  onToggleArticle: (articleId: string) => void;
  searchValue: string;
  selectedCategory: string;
  onLoadArticles?: (category: string) => Promise<void> | void;
};

const headers = [
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
];

const childHeaders = [
  "View Article",
  "Article",
  "Code",
  "Quantity",
  "Purity",
  "Net Wt.",
  "Stone Wt.",
  "Gross Wt.",
  "Checklist",
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function StockManagementTable({
  rows: externalRows,
  loading = false,
  loadingRowCategory = null,
  selectedArticles,
  reportedArticles,
  onToggleArticle,
  searchValue,
  selectedCategory,
  onLoadArticles,
}: StockManagementTableProps) {
  const rows = (externalRows ?? (stockRows as StockRow[])) as StockRow[];
  const [openRowId, setOpenRowId] = useState<string | number | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const filteredRows = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    return rows.filter((row) => {
      const categoryMatch =
        selectedCategory === "All" || row.category === selectedCategory;

      if (!categoryMatch) return false;

      if (!query) return true;

      const rowMatch =
        row.category.toLowerCase().includes(query) ||
        row.code.toLowerCase().includes(query) ||
        row.purity.toLowerCase().includes(query);

      const articleMatch = row.articles?.some(
        (article) =>
          article.article.toLowerCase().includes(query) ||
          article.code.toLowerCase().includes(query) ||
          article.purity.toLowerCase().includes(query)
      );

      return rowMatch || articleMatch;
    });
  }, [rows, searchValue, selectedCategory]);

  const toggleRow = async (row: StockRow, hasArticles: boolean) => {
    if (!hasArticles && !onLoadArticles) return;

    const nextOpen = openRowId === row.id ? null : row.id;
    setOpenRowId(nextOpen);

    if (nextOpen === row.id && onLoadArticles && !row.articles?.length) {
      await onLoadArticles(row.category);
    }
  };

  const isRowFullyReported = (row: StockRow) => {
    if (!row.articles?.length) return false;
    return row.articles.every((article) => reportedArticles[article.id]);
  };

  const openImagePreview = (images: string[], index: number) => {
    setPreviewImages(images);
    setPreviewIndex(index);
  };

  const closePreview = () => {
    setPreviewImages([]);
    setPreviewIndex(0);
  };

  const showPrevImage = () => {
    setPreviewIndex((prev) =>
      prev === 0 ? previewImages.length - 1 : prev - 1
    );
  };

  const showNextImage = () => {
    setPreviewIndex((prev) =>
      prev === previewImages.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!previewImages.length) return;

      if (e.key === "Escape") closePreview();
      if (e.key === "ArrowLeft") showPrevImage();
      if (e.key === "ArrowRight") showNextImage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImages.length]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;

    isDraggingRef.current = true;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container || !isDraggingRef.current) return;

    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = x - startXRef.current;
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-[30px] border border-[#E3E7ED] bg-[#FCFCFD] shadow-[0px_4px_14px_rgba(15,23,42,0.035)]">
        <div className="p-6">
          <div className="h-[360px] animate-pulse rounded-[24px] bg-[#F3F4F6]" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-[30px] border border-[#E3E7ED] bg-[#FCFCFD] shadow-[0px_4px_14px_rgba(15,23,42,0.035)]">
        <div
          ref={scrollRef}
          className="overflow-x-auto cursor-grab select-none active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
        >
          <table className="min-w-[1280px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#000000]">
                {headers.map((header, index) => (
                  <th
                    key={header}
                    className={cn(
                      "px-6 py-5 text-left text-[14px] font-semibold text-white whitespace-nowrap",
                      index === 0 && "rounded-tl-[30px]",
                      index === headers.length - 1 && "rounded-tr-[30px]",
                      [
                        "Quantity",
                        "Selling Price",
                        "Making Chg.",
                        "Purity",
                        "Net Wt.",
                        "Stone Wt.",
                        "Gross Wt.",
                        "Action",
                      ].includes(header) && "text-center"
                    )}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row, rowIndex) => {
                const hasArticles = !!row.articles?.length || !!onLoadArticles;
                const isOpen = openRowId === row.id;
                const isLastRow = rowIndex === filteredRows.length - 1;
                const rowCompleted = isRowFullyReported(row);
                const rowImages = row.articles?.map((article) => article.image) ?? [];
                const isRowLoading = loadingRowCategory === row.category;

                return (
                  <Fragment key={row.id}>
                    <tr className="bg-white transition hover:bg-[#FAFBFC]">
                      <td className="border-b border-r border-[#D9DDE3] px-6 py-5 text-[14px] font-medium text-[#1F2937]">
                        {row.category}
                      </td>

                      <td className="border-b border-r border-[#D9DDE3] px-6 py-5 text-center text-[14px] font-medium text-[#1F2937]">
                        {row.code}
                      </td>

                      <td className="border-b border-r border-[#D9DDE3] px-6 py-5 text-center text-[14px] font-medium text-[#1F2937]">
                        {row.quantity}
                      </td>

                      <td className="border-b border-r border-[#D9DDE3] px-6 py-5 text-center text-[14px] font-semibold text-[#1F2937]">
                        {row.sellingPrice}
                      </td>

                      <td className="border-b border-r border-[#D9DDE3] px-6 py-5 text-center text-[14px] font-semibold text-[#1F2937]">
                        {row.makingCharge}
                      </td>

                      <td className="border-b border-r border-[#D9DDE3] px-6 py-5 text-center text-[14px] font-medium text-[#1F2937]">
                        {row.purity}
                      </td>

                      <td className="border-b border-r border-[#D9DDE3] px-6 py-5 text-center text-[14px] font-medium text-[#1F2937]">
                        {row.netWeight}
                      </td>

                      <td className="border-b border-r border-[#D9DDE3] px-6 py-5 text-center text-[14px] font-medium text-[#1F2937]">
                        {row.stoneWeight}
                      </td>

                      <td className="border-b border-r border-[#D9DDE3] px-6 py-5 text-center text-[14px] font-medium text-[#1F2937]">
                        {row.grossWeight}
                      </td>

                      <td
                        className={cn(
                          "border-b border-[#D9DDE3] px-6 py-5 text-center",
                          !isOpen && isLastRow && "rounded-br-[30px]"
                        )}
                      >
                        <div className="flex items-center justify-center gap-3">
                          {rowCompleted && (
                            <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#22C55E] text-white shadow-[0px_4px_10px_rgba(34,197,94,0.24)]">
                              <Check size={16} strokeWidth={3} />
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleRow(row, hasArticles)}
                            disabled={!hasArticles}
                            className={cn(
                              "mx-auto flex items-center gap-2 text-[14px] font-medium text-[#1F2937] transition",
                              hasArticles
                                ? "cursor-pointer hover:text-black"
                                : "cursor-default opacity-70"
                            )}
                          >
                            <span>View Details</span>
                            {isOpen ? (
                              <ChevronUp size={18} strokeWidth={2.2} />
                            ) : (
                              <ChevronDown size={18} strokeWidth={2.2} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td
                          colSpan={10}
                          className={cn(
                            "bg-[#F4F7FA] p-0",
                            isLastRow && "rounded-b-[30px]"
                          )}
                        >
                          {isRowLoading ? (
                            <div className="px-6 py-8 text-center text-[14px] font-medium text-[#6B7280]">
                              Loading category items...
                            </div>
                          ) : row.articles?.length ? (
                            <div className="w-full overflow-hidden">
                              <table className="w-full border-separate border-spacing-0">
                                <thead>
                                  <tr className="bg-[#EEF3F7]">
                                    {childHeaders.map((header, index) => (
                                      <th
                                        key={header}
                                        className={cn(
                                          "border-b border-r border-[#D9DDE3] px-6 py-4 text-left text-[14px] font-semibold text-[#161616] whitespace-nowrap",
                                          [
                                            "Quantity",
                                            "Purity",
                                            "Net Wt.",
                                            "Stone Wt.",
                                            "Gross Wt.",
                                            "Checklist",
                                          ].includes(header) && "text-center",
                                          index === childHeaders.length - 1 && "border-r-0"
                                        )}
                                      >
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>

                                <tbody>
                                  {row.articles.map((article, articleIndex) => {
                                    const isLastArticle =
                                      articleIndex === row.articles!.length - 1;
                                    const isReported = !!reportedArticles[article.id];
                                    const isSelected = !!selectedArticles[article.id];

                                    return (
                                      <tr
                                        key={article.id}
                                        className="bg-[#F7FAFC] transition hover:bg-[#F2F7FB]"
                                      >
                                        <td className="border-b border-r border-[#D9DDE3] px-6 py-4">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              openImagePreview(rowImages, articleIndex)
                                            }
                                            className="block w-fit cursor-pointer"
                                          >
                                            <div className="relative h-[28px] w-[76px] overflow-hidden rounded-[6px] bg-[#F4DCE6] transition hover:opacity-90">
                                              <Image
                                                src={article.image}
                                                alt={article.article}
                                                fill
                                                className="object-cover"
                                                draggable={false}
                                              />
                                            </div>
                                          </button>
                                        </td>

                                        <td className="border-b border-r border-[#D9DDE3] px-6 py-4 text-[14px] font-medium text-[#1F2937]">
                                          <span className="text-[14px] font-medium text-[#1F2937]">
                                            {article.article}
                                          </span>
                                        </td>

                                        <td className="border-b border-r border-[#D9DDE3] px-6 py-4 text-[14px] font-medium text-[#1F2937]">
                                          {article.code}
                                        </td>

                                        <td className="border-b border-r border-[#D9DDE3] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {article.quantity}
                                        </td>

                                        <td className="border-b border-r border-[#D9DDE3] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {article.purity}
                                        </td>

                                        <td className="border-b border-r border-[#D9DDE3] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {article.netWeight}
                                        </td>

                                        <td className="border-b border-r border-[#D9DDE3] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {article.stoneWeight}
                                        </td>

                                        <td className="border-b border-r border-[#D9DDE3] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {article.grossWeight}
                                        </td>

                                        <td
                                          className={cn(
                                            "border-b border-[#D9DDE3] px-6 py-4 text-center",
                                            isLastArticle && isLastRow && "rounded-br-[30px]"
                                          )}
                                        >
                                          {isReported ? (
                                            <span className="mx-auto inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#22C55E] text-white shadow-[0px_4px_10px_rgba(34,197,94,0.24)]">
                                              <Check size={16} strokeWidth={3} />
                                            </span>
                                          ) : (
                                            <label className="inline-flex cursor-pointer items-center justify-center">
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => onToggleArticle(article.id)}
                                                className="peer sr-only"
                                              />
                                              <span
                                                className={cn(
                                                  "flex h-[22px] w-[22px] items-center justify-center rounded-[6px] border transition-all",
                                                  isSelected
                                                    ? "border-[#020222] bg-[#020222]"
                                                    : "border-[#B8C0CC] bg-white"
                                                )}
                                              >
                                                {isSelected && (
                                                  <Check
                                                    size={14}
                                                    strokeWidth={3}
                                                    className="text-white"
                                                  />
                                                )}
                                              </span>
                                            </label>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="px-6 py-8 text-center text-[14px] font-medium text-[#6B7280]">
                              No category items found.
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-10 text-center text-[15px] font-medium text-[#6B7280]"
                  >
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {previewImages.length > 0 && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4">
          <button
            type="button"
            onClick={closePreview}
            className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <X size={22} />
          </button>

          {previewImages.length > 1 && (
            <button
              type="button"
              onClick={showPrevImage}
              className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <div className="relative h-[70vh] w-full max-w-[900px] overflow-hidden rounded-[24px] bg-white">
            <Image
              src={previewImages[previewIndex]}
              alt={`Preview ${previewIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {previewImages.length > 1 && (
            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ChevronRight size={22} />
            </button>
          )}

          {previewImages.length > 1 && (
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <span>{previewIndex + 1}</span>
              <span>/</span>
              <span>{previewImages.length}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}