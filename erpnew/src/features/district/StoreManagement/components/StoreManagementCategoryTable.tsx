"use client";

import Image from "next/image";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, X } from "lucide-react";
import type { Category, Item } from "../types";

type Props = {
  storeId: string;
  categories?: Category[];
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

function DragScrollArea({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let down = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      if ((e.target as HTMLElement)?.closest("button,input,select,label")) return;

      down = true;
      startX = e.clientX;
      scrollLeft = el.scrollLeft;
    };

    const onMove = (e: PointerEvent) => {
      if (!down) return;
      e.preventDefault();
      setDragging(true);
      el.scrollLeft = scrollLeft - (e.clientX - startX);
    };

    const onEnd = () => {
      down = false;
      setDragging(false);
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onEnd);
    el.addEventListener("pointercancel", onEnd);
    el.addEventListener("pointerleave", onEnd);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onEnd);
      el.removeEventListener("pointercancel", onEnd);
      el.removeEventListener("pointerleave", onEnd);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "store-table-scroll w-full overflow-x-auto overflow-y-hidden overscroll-x-contain",
        dragging ? "cursor-grabbing" : "cursor-grab"
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
        className="relative w-full max-w-3xl rounded-erp-xl bg-white p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-erp-full bg-white/90 text-erp-text-soft shadow-erp-card transition hover:bg-white hover:text-erp-heading"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-erp-md bg-erp-card-soft">
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
    setOpenCategoryId(null);
  }, [safeCategories.length]);

  const getCurrentItems = (category: Category) => {
    const loadedItems = itemsMap[category.id];
    if (Array.isArray(loadedItems)) return loadedItems;
    return category.items ?? [];
  };

  const handleToggleRow = async (category: Category) => {
    const categoryId = category.id;

    if (openCategoryId === categoryId) {
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
        [categoryId]: Array.isArray(items) ? items : [],
      }));

      setLoadedMap((prev) => ({ ...prev, [categoryId]: true }));
    } catch (error) {
      setItemsMap((prev) => ({
        ...prev,
        [categoryId]: category.items ?? [],
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

      <div className="overflow-hidden rounded-erp-2xl border border-erp-border bg-white shadow-erp-card">
        <DragScrollArea>
          <table className="w-full min-w-[1180px] border-separate border-spacing-0 font-erp">
            <thead>
              <tr className="bg-erp-dark">
                {parentHeaders.map((header, index) => (
                  <th
                    key={header}
                    className={cn(
                      "whitespace-nowrap px-6 py-6 text-left text-[15px] font-semibold leading-[20px] tracking-[-0.02em] text-white",
                      index === 0 && "rounded-tl-erp-2xl",
                      index === parentHeaders.length - 1 && "rounded-tr-erp-2xl",
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
                    <tr className="bg-white transition hover:bg-erp-card-soft">
                      <td className="border-b border-r border-erp-border px-6 py-7 text-[15px] font-medium tracking-[-0.02em] text-erp-heading">
                        {category.name}
                      </td>

                      <td className="border-b border-r border-erp-border px-6 py-7 text-[15px] font-medium text-erp-heading">
                        {category.code}
                      </td>

                      <td className="border-b border-r border-erp-border px-6 py-7 text-center text-[15px] font-medium text-erp-heading">
                        {category.quantity}
                      </td>

                      <td className="border-b border-r border-erp-border px-6 py-7 text-center text-[15px] font-medium text-erp-heading">
                        {category.sellingPrice}
                      </td>

                      <td className="border-b border-r border-erp-border px-6 py-7 text-center text-[15px] font-medium text-erp-heading">
                        {category.makingCharge}
                      </td>

                      <td className="border-b border-r border-erp-border px-6 py-7 text-center text-[15px] font-medium text-erp-heading">
                        {category.purity}
                      </td>

                      <td className="border-b border-r border-erp-border px-6 py-7 text-center text-[15px] font-medium text-erp-heading">
                        {category.netWt}
                      </td>

                      <td className="border-b border-r border-erp-border px-6 py-7 text-center text-[15px] font-medium text-erp-heading">
                        {category.stoneWt}
                      </td>

                      <td className="border-b border-r border-erp-border px-6 py-7 text-center text-[15px] font-medium text-erp-heading">
                        {category.grossWt}
                      </td>

                      <td
                        className={cn(
                          "border-b border-erp-border px-6 py-7 text-center",
                          !isOpen && isLastRow && "rounded-br-erp-2xl"
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleRow(category)}
                          className="inline-flex items-center gap-2 text-[15px] font-semibold text-erp-primary underline underline-offset-2 transition hover:text-erp-primary-hover"
                        >
                          View
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
                        <td colSpan={10} className="bg-erp-card-soft p-0">
                          <table className="w-full border-separate border-spacing-0">
                            <thead>
                              <tr className="bg-[#EEF2F7]">
                                {childHeaders.map((header, index) => (
                                  <th
                                    key={header}
                                    className={cn(
                                      "whitespace-nowrap border-b border-r border-erp-border px-6 py-4 text-left text-[14px] font-semibold text-erp-heading",
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
                              {isLoading ? (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="px-6 py-8 text-center text-[14px] font-medium text-erp-muted"
                                  >
                                    Loading items...
                                  </td>
                                </tr>
                              ) : error && items.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="px-6 py-8 text-center text-[14px] font-medium text-erp-danger"
                                  >
                                    {error}
                                  </td>
                                </tr>
                              ) : items.length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="px-6 py-8 text-center text-[14px] font-medium text-erp-muted"
                                  >
                                    No items found.
                                  </td>
                                </tr>
                              ) : (
                                items.map((item) => (
                                  <tr
                                    key={item.id}
                                    className="bg-erp-card-soft transition hover:bg-[#F1F5F9]"
                                  >
                                    <td className="border-b border-r border-erp-border px-6 py-4">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPreviewImage(item.image)
                                        }
                                        className="block w-fit cursor-pointer"
                                      >
                                        <div className="relative h-[34px] w-[82px] overflow-hidden rounded-[8px] bg-[#F4DCE6]">
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

                                    <td className="border-b border-r border-erp-border px-6 py-4 text-[14px] font-medium text-erp-text-soft">
                                      {item.name}
                                    </td>

                                    <td className="border-b border-r border-erp-border px-6 py-4 text-[14px] font-medium text-erp-text-soft">
                                      {item.code}
                                    </td>

                                    <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-erp-text-soft">
                                      {item.quantity}
                                    </td>

                                    <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-erp-text-soft">
                                      {item.purity}
                                    </td>

                                    <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-erp-text-soft">
                                      {item.netWt}
                                    </td>

                                    <td className="border-b border-r border-erp-border px-6 py-4 text-center text-[14px] font-medium text-erp-text-soft">
                                      {item.stoneWt}
                                    </td>

                                    <td className="border-b border-erp-border px-6 py-4 text-center text-[14px] font-medium text-erp-text-soft">
                                      {item.grossWt}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {!safeCategories.length && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-6 py-10 text-center text-[15px] font-medium text-erp-muted"
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