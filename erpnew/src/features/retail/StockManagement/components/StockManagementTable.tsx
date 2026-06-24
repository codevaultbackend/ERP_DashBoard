"use client";

import Image from "next/image";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  X,
} from "lucide-react";
import StockAuditPopup from "./StockAuditPopup";
import type { AuditStatus } from "../api/audit-api";
import { stockApi } from "../api/stock-management-api";

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
  category: string;
  sellingPrice?: string;
  makingCharge?: string;
  isItemAudit?: boolean;
  itemAuditAt?: string | null;
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

type AuditMap = Record<
  string,
  {
    status: AuditStatus;
    remark: string;
    category: string;
  }
>;

type Props = {
  rows: StockRow[];
  loading?: boolean;
  loadingRowCategory?: string | null;
  auditMode?: boolean;
  auditMap: AuditMap;
  setAuditMap: React.Dispatch<React.SetStateAction<AuditMap>>;
  reportedArticles?: Record<string, boolean>;
  searchValue: string;
  selectedCategory: string;
  onLoadArticles: (category: string) => Promise<void> | void;
};

const headers = [
  "Category",
  "Quantity",
  "Selling Price",
  "Making Chg.",
  "Purity",
  "Net Wt.",
  "Stone Wt.",
  "Gross Wt.",
  "Action",
];

const getChildHeaders = (auditMode: boolean) => [
  "View Article",
  "Article",
  "Code",
  "Quantity",
  "Selling Price",
  "Making Chg.",
  "Purity",
  "Net Wt.",
  "Stone Wt.",
  "Gross Wt.",
  ...(auditMode ? ["Checklist"] : []),
];;

const FALLBACK_IMAGE = "/placeholder-product.png";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function safeValue(value: unknown, fallback = "--") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function isAuditDoneToday(article: StockArticle) {
  if (!article.isItemAudit || !article.itemAuditAt) return false;

  const auditDate = new Date(article.itemAuditAt);
  if (Number.isNaN(auditDate.getTime())) return false;

  const today = new Date();

  return (
    auditDate.getFullYear() === today.getFullYear() &&
    auditDate.getMonth() === today.getMonth() &&
    auditDate.getDate() === today.getDate()
  );
}

export async function updateItemImage(
  itemId: string | number,
  image: File
) {
  const formData = new FormData();

  formData.append("image", image);


  const res = await stockApi.patch(
    `/stock/item/${itemId}/image`,
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return res.data;
}

export default function StockManagementTable({
  rows = [],
  auditMode = false,
  loading,
  loadingRowCategory,
  auditMap,
  setAuditMap,
  reportedArticles = {},
  searchValue,
  selectedCategory,
  onLoadArticles,
}: Props) {
  const [openRowId, setOpenRowId] = useState<string | number | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [uploadingImageId, setUploadingImageId] =
    useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  const [reasonPopup, setReasonPopup] = useState<{
    id: string;
    name: string;
    category: string;
    remark: string;
  } | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const didDragRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const filteredRows = useMemo(() => {
    const query = (searchValue ?? "").trim().toLowerCase();

    return rows.filter((row) => {
      const categoryMatch =
        selectedCategory === "All" || row.category === selectedCategory;

      if (!categoryMatch) return false;
      if (!query) return true;

      const rowMatch =
        row.category?.toLowerCase().includes(query) ||
        row.code?.toLowerCase().includes(query) ||
        row.purity?.toLowerCase().includes(query);

      const articleMatch = row.articles?.some((article) => {
        return (
          article.article?.toLowerCase().includes(query) ||
          article.code?.toLowerCase().includes(query) ||
          article.purity?.toLowerCase().includes(query)
        );
      });

      return rowMatch || articleMatch;
    });
  }, [rows, searchValue, selectedCategory]);


  const childHeaders = getChildHeaders(auditMode);

  const toggleRow = async (row: StockRow) => {
    if (didDragRef.current) return;

    const nextOpen = openRowId === row.id ? null : row.id;
    setOpenRowId(nextOpen);

    if (nextOpen === row.id && !row.articles?.length) {
      await onLoadArticles(row.category);
    }
  };



  const handleImageUpload = async (
    itemId: string,
    file: File
  ) => {
    try {
      setUploadingImageId(itemId);

      const formData = new FormData();

      formData.append("image", file);

      const response =
        await stockApi.patch(
          `stock/item/${itemId}/image`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      console.log(
        "IMAGE UPDATED",
        response.data
      );

      window.location.reload();
    } catch (error) {
      console.error(
        "Failed to update image",
        error
      );

      alert(
        "Failed to update item image"
      );
    } finally {
      setUploadingImageId(null);
    }
  };

  const isArticleCompletedAfterApi = (articleId: string) => {
    return Boolean(reportedArticles[articleId]);
  };

  const isArticleDone = (article: StockArticle) => {
    return isAuditDoneToday(article) || isArticleCompletedAfterApi(article.id);
  };

  const isArticleValidForAudit = (article: StockArticle) => {
    if (isArticleDone(article)) return true;

    const audit = auditMap[article.id];

    if (!audit?.status) return false;
    if (audit.status === "missing" && !audit.remark?.trim()) return false;

    return audit.status === "present" || audit.status === "missing";
  };

  const isRowFullyReported = (row: StockRow) => {
    if (!row.articles?.length) return false;
    return row.articles.every((article) => isArticleValidForAudit(article));
  };

  const markDone = (article: StockArticle) => {
    if (isArticleDone(article)) return;

    setAuditMap((prev) => ({
      ...prev,
      [article.id]: {
        status: "present",
        remark: "",
        category: article.category,
      },
    }));
  };

  const openReason = (article: StockArticle) => {
    if (isArticleDone(article)) return;

    setAuditMap((prev) => ({
      ...prev,
      [article.id]: {
        status: "missing",
        remark: prev[article.id]?.remark || "",
        category: article.category,
      },
    }));

    setReasonPopup({
      id: article.id,
      name: article.article,
      category: article.category,
      remark: auditMap[article.id]?.remark || "",
    });
  };

  const saveReason = () => {
    if (!reasonPopup?.remark.trim()) return;

    setAuditMap((prev) => ({
      ...prev,
      [reasonPopup.id]: {
        status: "missing",
        remark: reasonPopup.remark.trim(),
        category: reasonPopup.category,
      },
    }));

    setReasonPopup(null);
  };

  const openImagePreview = (images: string[], index: number) => {
    const safeImages = images.filter(Boolean);

    if (!safeImages.length) return;

    setPreviewImages(safeImages);
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

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewImages.length]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;

    isDraggingRef.current = true;
    didDragRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container || !isDraggingRef.current) return;

    const x = e.pageX - container.offsetLeft;
    const walk = x - startXRef.current;

    if (Math.abs(walk) > 5) {
      didDragRef.current = true;
    }

    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const stopDragging = () => {
    isDraggingRef.current = false;

    window.setTimeout(() => {
      didDragRef.current = false;
    }, 0);
  };

  if (loading) {
    return (
      <div className="overflow-hidden rounded-[30px] border border-erp-border bg-erp-card shadow-erp-card">
        <div className="p-6">
          <div className="h-[360px] animate-pulse rounded-[24px] bg-[#F3F4F6]" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-[30px] border border-erp-border bg-erp-card shadow-erp-card">
        <div
          ref={scrollRef}
          className="dashboard-hidden-scroll cursor-grab select-none overflow-x-auto active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
        >
          <table className="w-full min-w-[1320px] border-separate border-spacing-0">
            <thead>
              <tr className="bg-black">
                {headers.map((header, index) => (
                  <th
                    key={header}
                    className={cn(
                      "h-[56px] border-r border-black px-6 text-left text-[15px] font-semibold leading-none whitespace-nowrap text-white",
                      index === 0 && "rounded-tl-[30px]",
                      index === headers.length - 1 &&
                      "rounded-tr-[30px] border-r-0",
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
              {filteredRows.map((row) => {
                const isOpen = openRowId === row.id;
                const rowCompleted = isRowFullyReported(row);
                const rowImages =
                  row.articles?.map((article) => article.image || FALLBACK_IMAGE) ??
                  [];
                const isRowLoading = loadingRowCategory === row.category;

                return (
                  <Fragment key={row.id}>
                    <tr className="bg-white transition hover:bg-[#FAFBFC]">
                      <td className="h-[54px] border-b border-r border-erp-border px-6 text-[15px] font-normal text-[#111827]">
                        {safeValue(row.category)}
                      </td>
                      <td className="h-[54px] border-b border-r border-erp-border px-6 text-center text-[15px] font-normal text-[#111827]">
                        {safeValue(row.quantity, "0")}
                      </td>

                      <td className="h-[54px] border-b border-r border-erp-border px-6 text-center text-[15px] font-semibold text-[#111827]">
                        {safeValue(row.sellingPrice)}
                      </td>

                      <td className="h-[54px] border-b border-r border-erp-border px-6 text-center text-[15px] font-semibold text-[#111827]">
                        {safeValue(row.makingCharge)}
                      </td>

                      <td className="h-[54px] border-b border-r border-erp-border px-6 text-center text-[15px] font-semibold text-[#111827]">
                        {safeValue(row.purity)}
                      </td>

                      <td className="h-[54px] border-b border-r border-erp-border px-6 text-center text-[15px] font-semibold text-[#111827]">
                        {safeValue(row.netWeight)}
                      </td>

                      <td className="h-[54px] border-b border-r border-erp-border px-6 text-center text-[15px] font-semibold text-[#111827]">
                        {safeValue(row.stoneWeight)}
                      </td>

                      <td className="h-[54px] border-b border-r border-erp-border px-6 text-center text-[15px] font-semibold text-[#111827]">
                        {safeValue(row.grossWeight)}
                      </td>

                      <td className="h-[54px] border-b border-erp-border px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          {rowCompleted && (
                            <span className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full bg-erp-success text-white shadow-[0px_4px_10px_rgba(22,184,51,0.24)]">
                              <Check size={15} strokeWidth={3} />
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleRow(row)}
                            className="text-[15px] font-medium text-[#2563EB] underline underline-offset-2 transition hover:text-[#1D4ED8]"
                          >
                            {isOpen ? (
                              <span className="inline-flex items-center gap-1">
                                Hide <ChevronUp size={15} strokeWidth={2.4} />
                              </span>
                            ) : (
                              "View"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td colSpan={headers.length} className="bg-[#F4F7FA] p-0">
                          {isRowLoading ? (
                            <div className="px-6 py-8 text-center text-[14px] font-medium text-erp-muted">
                              Loading category items...
                            </div>
                          ) : row.articles?.length ? (
                            <div className="w-full overflow-x-auto">
                              <table className="w-full min-w-[1320px] border-separate border-spacing-0">
                                <thead>
                                  <tr className="bg-[#EEF3F7]">
                                    {childHeaders.map((header, index) => (
                                      <th
                                        key={header}
                                        className={cn(
                                          "h-[48px] border-b border-r border-erp-border px-6 text-left text-[14px] font-semibold whitespace-nowrap text-[#161616]",
                                          [
                                            "Code",
                                            "Quantity",
                                            "Selling Price",
                                            "Making Chg.",
                                            "Purity",
                                            "Net Wt.",
                                            "Stone Wt.",
                                            "Gross Wt.",
                                            "Checklist",
                                          ].includes(header) && "text-center",
                                          index === childHeaders.length - 1 &&
                                          "border-r-0"
                                        )}
                                      >
                                        {header}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>

                                <tbody>
                                  {row.articles.map((article, articleIndex) => {
                                    const audit = auditMap[article.id];
                                    const isDone = audit?.status === "present";
                                    const isMissing =
                                      audit?.status === "missing";
                                    const isCompleted = isArticleDone(article);
                                    const articleImage =
                                      article.image || FALLBACK_IMAGE;

                                    return (
                                      <tr
                                        key={article.id}
                                        className="bg-[#F7FAFC] transition hover:bg-[#F2F7FB]"
                                      >
                                        <td className="border-b border-r border-erp-border px-6 py-4">
                                          <div className="flex flex-col items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                openImagePreview(
                                                  rowImages,
                                                  articleIndex
                                                )
                                              }
                                              className="block"
                                            >
                                              <div className="relative h-[28px] w-[76px] overflow-hidden rounded-[6px]">
                                                <Image
                                                  src={articleImage}
                                                  alt={article.article}
                                                  fill
                                                  sizes="76px"
                                                  className="object-contain"
                                                />
                                              </div>
                                            </button>

                                            <label className="cursor-pointer text-[11px] font-medium text-blue-600 underline">
                                              {uploadingImageId === article.id
                                                ? "Uploading..."
                                                : "Edit Image"}

                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={
                                                  uploadingImageId === article.id
                                                }
                                                onChange={(e) => {
                                                  const file =
                                                    e.target.files?.[0];

                                                  if (!file) return;

                                                  handleImageUpload(
                                                    article.id,
                                                    file
                                                  );
                                                }}
                                              />
                                            </label>
                                          </div>
                                        </td>

                                        <td className="border-b border-r border-erp-border px-6 py-4 text-[14px] font-medium text-[#1F2937]">
                                          {safeValue(article.article)}
                                        </td>

                                        <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {safeValue(article.code)}
                                        </td>

                                        <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {safeValue(article.quantity, "0")}
                                        </td>

                                        <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {safeValue(
                                            article.sellingPrice ||
                                            row.sellingPrice
                                          )}
                                        </td>

                                        <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {safeValue(
                                            article.makingCharge ||
                                            row.makingCharge
                                          )}
                                        </td>

                                        <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {safeValue(article.purity)}
                                        </td>

                                        <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {safeValue(article.netWeight)}
                                        </td>

                                        <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {safeValue(article.stoneWeight)}
                                        </td>

                                        <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {safeValue(article.grossWeight)}
                                        </td>
                                        {auditMode && (
                                          <td className="border-b border-erp-border px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                              {isCompleted ? (
                                                <div className="inline-flex h-[30px] min-w-[116px] items-center justify-center gap-2 rounded-full border border-erp-success bg-erp-success-soft px-3 text-[11px] font-semibold text-erp-success">
                                                  <span className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-full bg-erp-success text-white">
                                                    <Check
                                                      size={12}
                                                      strokeWidth={3}
                                                    />
                                                  </span>
                                                  Audit Done
                                                </div>
                                              ) : (
                                                <>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      markDone(article)
                                                    }
                                                    className={cn(
                                                      "inline-flex h-[30px] min-w-[78px] items-center justify-center gap-2 rounded-full border px-3 text-[11px] font-semibold transition",
                                                      isDone
                                                        ? "border-erp-success bg-erp-success-soft text-erp-success"
                                                        : "border-erp-border bg-white text-[#1F2937] hover:border-erp-success"
                                                    )}
                                                  >
                                                    <span
                                                      className={cn(
                                                        "h-[10px] w-[10px] rounded-full border",
                                                        isDone
                                                          ? "border-erp-success bg-erp-success"
                                                          : "border-[#9CA3AF] bg-white"
                                                      )}
                                                    />
                                                    Done
                                                  </button>

                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      openReason(article)
                                                    }
                                                    className={cn(
                                                      "inline-flex h-[30px] min-w-[92px] whitespace-nowrap items-center justify-center gap-2 rounded-full border px-3 text-[11px] font-semibold transition",
                                                      isMissing
                                                        ? "border-erp-danger bg-erp-danger-soft text-erp-danger"
                                                        : "border-erp-border bg-white text-[#1F2937] hover:border-erp-danger"
                                                    )}
                                                  >
                                                    <span
                                                      className={cn(
                                                        "h-[10px] w-[10px] rounded-full border",
                                                        isMissing
                                                          ? "border-erp-danger bg-erp-danger"
                                                          : "border-[#9CA3AF] bg-white"
                                                      )}
                                                    />
                                                    Not Done
                                                  </button>
                                                </>
                                              )}
                                            </div>

                                            {!isCompleted && !audit?.status ? (
                                              <p className="mt-1 text-[11px] font-medium text-erp-danger">
                                                Required
                                              </p>
                                            ) : null}

                                            {!isCompleted &&
                                              isMissing &&
                                              audit?.remark ? (
                                              <p className="mt-1 line-clamp-1 text-[11px] font-medium text-erp-danger">
                                                {audit.remark}
                                              </p>
                                            ) : null}
                                          </td>)}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="px-6 py-8 text-center text-[14px] font-medium text-erp-muted">
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
                    colSpan={headers.length}
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
              src={previewImages[previewIndex] || FALLBACK_IMAGE}
              alt={`Preview ${previewIndex + 1}`}
              fill
              sizes="900px"
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
        </div>
      )}

      {reasonPopup && (
        <StockAuditPopup
          open={Boolean(reasonPopup)}
          itemName={reasonPopup.name}
          remark={reasonPopup.remark}
          onChange={(value) =>
            setReasonPopup((prev) =>
              prev ? { ...prev, remark: value } : prev
            )
          }
          onClose={() => setReasonPopup(null)}
          onSubmit={saveReason}
        />
      )}
    </>
  );
}