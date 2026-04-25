"use client";

import Image from "next/image";
import React, { Fragment, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
} from "lucide-react";
import { Category, Item } from "../types";

type Props = {
  storeId: string;
  categories?: Category[];
  onAuditSubmit: (categoryId: string, issue: any) => void;
  onLoadCategoryItems?: (category: Category) => Promise<Item[]>;
};

const parentHeaders = [
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
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isInteractiveElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;

  return !!target.closest(
    'button, a, input, select, textarea, label, [role="button"], [data-no-drag="true"]'
  );
}

function DragScrollArea({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let pointerDown = false;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let pointerId: number | null = null;

    const DRAG_THRESHOLD = 6;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      if (isInteractiveElement(e.target)) return;

      pointerDown = true;
      isDragging = false;
      startX = e.clientX;
      startY = e.clientY;
      scrollLeft = el.scrollLeft;
      pointerId = e.pointerId;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerDown) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!isDragging) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        if (Math.abs(dx) < Math.abs(dy)) return;

        isDragging = true;
        setDragging(true);

        if (pointerId !== null) {
          try {
            el.setPointerCapture(pointerId);
          } catch {}
        }
      }

      e.preventDefault();
      el.scrollLeft = scrollLeft - dx;
    };

    const endDrag = () => {
      pointerDown = false;
      isDragging = false;
      setDragging(false);

      if (pointerId !== null) {
        try {
          if (el.hasPointerCapture(pointerId)) {
            el.releasePointerCapture(pointerId);
          }
        } catch {}
      }

      pointerId = null;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("pointerleave", endDrag);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endDrag);
      el.removeEventListener("pointercancel", endDrag);
      el.removeEventListener("pointerleave", endDrag);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "store-table-scroll w-full overflow-x-auto overflow-y-hidden overscroll-x-contain",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
    >
      {children}
    </div>
  );
}

function ImagePreviewModal({
  image,
  onClose,
}: {
  image: string | null;
  onClose: () => void;
}) {
  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow"
          data-no-drag="true"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
          <Image src={image} alt="Preview" fill className="object-contain" />
        </div>
      </div>
    </div>
  );
}

export default function StoreManagementCategoryTable({
  categories = [],
  onLoadCategoryItems,
}: Props) {
  const safeCategories = Array.isArray(categories) ? categories : [];

  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [itemsMap, setItemsMap] = useState<Record<string, Item[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    setItemsMap({});
    setLoadingMap({});
    setLoadedMap({});
    setErrorMap({});
  }, [safeCategories]);

  const getCurrentItems = (category: Category) => {
    const loadedItems = itemsMap[category.id];
    if (Array.isArray(loadedItems) && loadedItems.length > 0) return loadedItems;
    return category.items ?? [];
  };

  const handleToggleRow = async (category: Category) => {
    const categoryId = category.id;
    const isOpen = openCategoryId === categoryId;

    if (isOpen) {
      setOpenCategoryId(null);
      return;
    }

    setOpenCategoryId(categoryId);

    if (loadedMap[categoryId] || !onLoadCategoryItems) return;

    try {
      setLoadingMap((prev) => ({ ...prev, [categoryId]: true }));
      setErrorMap((prev) => ({ ...prev, [categoryId]: "" }));

      const items = await onLoadCategoryItems(category);

      setItemsMap((prev) => ({
        ...prev,
        [categoryId]:
          items.length ? items : prev[categoryId] ?? category.items ?? [],
      }));
      setLoadedMap((prev) => ({ ...prev, [categoryId]: true }));
    } catch (error) {
      setItemsMap((prev) => ({
        ...prev,
        [categoryId]: prev[categoryId] ?? category.items ?? [],
      }));
      setLoadedMap((prev) => ({ ...prev, [categoryId]: true }));
      setErrorMap((prev) => ({
        ...prev,
        [categoryId]:
          error instanceof Error
            ? error.message
            : "Failed to load category items.",
      }));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  return (
    <>
      <style jsx>{`
        .store-table-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        .store-table-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white shadow-[0px_1px_2px_rgba(15,23,42,0.05),0px_1px_3px_rgba(15,23,42,0.08)] md:rounded-[32px]">
        <DragScrollArea>
          <table className="min-w-[1200px] w-full border-separate border-spacing-0">
            <thead>
              <tr className="bg-[#020617]">
                {parentHeaders.map((header, index) => (
                  <th
                    key={header}
                    className={cn(
                      "px-6 py-6 text-left text-[15px] font-semibold text-white whitespace-nowrap",
                      index === 0 && "rounded-tl-[24px] md:rounded-tl-[32px]",
                      index === parentHeaders.length - 1 &&
                        "rounded-tr-[24px] md:rounded-tr-[32px]",
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
              {safeCategories.map((category, rowIndex) => {
                const isOpen = openCategoryId === category.id;
                const isLastRow = rowIndex === safeCategories.length - 1;
                const items = getCurrentItems(category);
                const isLoading = !!loadingMap[category.id];
                const error = errorMap[category.id] || "";

                return (
                  <Fragment key={category.id}>
                    <tr className="bg-white transition hover:bg-[#FAFBFC]">
                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-[15px] font-medium text-[#0F172A]">
                        {category.name}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-[15px] font-medium text-[#0F172A]">
                        {category.code}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.quantity}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.sellingPrice}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.makingCharge}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.purity}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.netWt}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.stoneWt}
                      </td>

                      <td className="border-b border-r border-[#E5E7EB] px-6 py-7 text-center text-[15px] font-medium text-[#0F172A]">
                        {category.grossWt}
                      </td>

                      <td
                        className={cn(
                          "border-b border-[#E5E7EB] px-6 py-7 text-center",
                          !isOpen && isLastRow && "rounded-br-[24px] md:rounded-br-[32px]"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleRow(category)}
                          className="inline-flex items-center gap-2 text-[15px] font-medium text-[#2563EB] hover:text-[#1D4ED8]"
                          data-no-drag="true"
                        >
                          <span>View</span>
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr>
                        <td
                          colSpan={10}
                          className={cn(
                            "bg-[#F8FAFC] p-0",
                            isLastRow && "rounded-b-[24px] md:rounded-b-[32px]"
                          )}
                        >
                          <div className="w-full overflow-hidden">
                            <div className="border-b border-[#E5E7EB] bg-[#EEF2F7] px-6 py-4">
                              <h3 className="text-[15px] font-semibold text-[#111827]">
                                {category.name} Items
                              </h3>
                            </div>

                            <table className="w-full border-separate border-spacing-0">
                              <thead>
                                <tr className="bg-[#EEF2F7]">
                                  {childHeaders.map((header, index) => (
                                    <th
                                      key={header}
                                      className={cn(
                                        "border-b border-r border-[#E5E7EB] px-6 py-4 text-left text-[14px] font-semibold text-[#161616] whitespace-nowrap",
                                        [
                                          "Quantity",
                                          "Purity",
                                          "Net Wt.",
                                          "Stone Wt.",
                                          "Gross Wt.",
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
                                {isLoading && items.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={8}
                                      className="px-6 py-8 text-center text-[14px] font-medium text-[#64748B]"
                                    >
                                      Loading items...
                                    </td>
                                  </tr>
                                ) : error && items.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan={8}
                                      className="px-6 py-8 text-center text-[14px] font-medium text-[#B42318]"
                                    >
                                      {error}
                                    </td>
                                  </tr>
                                ) : items.length > 0 ? (
                                  items.map((item, itemIndex) => {
                                    const isLastItem =
                                      itemIndex === items.length - 1;

                                    return (
                                      <tr
                                        key={item.id}
                                        className="bg-[#F8FAFC] transition hover:bg-[#F1F5F9]"
                                      >
                                        <td className="border-b border-r border-[#E5E7EB] px-6 py-4">
                                          <button
                                            type="button"
                                            onClick={() => setPreviewImage(item.image)}
                                            className="block w-fit cursor-pointer"
                                            data-no-drag="true"
                                          >
                                            <div className="relative h-[28px] w-[76px] overflow-hidden rounded-[6px] bg-[#F4DCE6] transition hover:opacity-90">
                                              <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                draggable={false}
                                              />
                                            </div>
                                          </button>
                                        </td>

                                        <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-[14px] font-medium text-[#1F2937]">
                                          {item.name}
                                        </td>

                                        <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-[14px] font-medium text-[#1F2937]">
                                          {item.code}
                                        </td>

                                        <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {item.quantity}
                                        </td>

                                        <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {item.purity}
                                        </td>

                                        <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {item.netWt}
                                        </td>

                                        <td className="border-b border-r border-[#E5E7EB] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]">
                                          {item.stoneWt}
                                        </td>

                                        <td
                                          className={cn(
                                            "border-b border-[#E5E7EB] px-6 py-4 text-center text-[14px] font-medium text-[#1F2937]",
                                            isLastItem &&
                                              isLastRow &&
                                              "rounded-br-[24px] md:rounded-br-[32px]"
                                          )}
                                        >
                                          {item.grossWt}
                                        </td>
                                      </tr>
                                    );
                                  })
                                ) : (
                                  <tr>
                                    <td
                                      colSpan={8}
                                      className="px-6 py-8 text-center text-[14px] font-medium text-[#64748B]"
                                    >
                                      No items found.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {safeCategories.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-10 text-center text-[15px] font-medium text-[#6B7280]"
                  >
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </DragScrollArea>
      </div>

      <ImagePreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}