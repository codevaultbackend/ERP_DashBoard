import {
    Pencil,
    Eye,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import EditStockPricingModal from "../pricing/EditStockPricingModal";
import { Fragment } from "react";
import type { CategoryRow, ArticleRow } from "../types";
import { stockApi } from "@/features/district/stock/stockApi";

export async function updateItemImage(
    itemId: string | number,
    image: File
) {
    const formData = new FormData();

    formData.append("image", image);

    return stockApi.patch(
        `/stock/item/${itemId}/image`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
}

export default function StockTable({
    rows,
    loading,
    searchValue,
    selectedCategory,
    loadingCategory,
    onLoadArticles,
    onPricingUpdated,
}: {
    rows: CategoryRow[];
    loading: boolean;
    searchValue: string;
    selectedCategory: string;
    loadingCategory: string | null;
    onLoadArticles: (category: string) => Promise<void>;
    onPricingUpdated: () => Promise<void>;
}) {
    const [openRowId, setOpenRowId] = useState<string | null>(null);
    const [parentViewportWidth, setParentViewportWidth] = useState(0);
    const [pricingItem, setPricingItem] = useState<ArticleRow | null>(null);

    const parentScrollRef = useRef<HTMLDivElement | null>(null);
    const childScrollRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const router = useRouter();
    const FALLBACK_IMAGE = "/placeholder-product.png";

    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [uploadingImageId, setUploadingImageId] =
        useState<string | null>(null);

    const openImagePreview = (
        images: string[],
        index: number
    ) => {
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
            prev === 0
                ? previewImages.length - 1
                : prev - 1
        );
    };

    const showNextImage = () => {
        setPreviewIndex((prev) =>
            prev === previewImages.length - 1
                ? 0
                : prev + 1
        );
    };
    const handleImageUpload = async (
        itemId: string,
        file: File
    ) => {
        try {
            setUploadingImageId(itemId);

            await updateItemImage(itemId, file);

            await onPricingUpdated();
        } catch (error) {
            console.error(error);
        } finally {
            setUploadingImageId(null);
        }
    };

    const parentColumns = [
        { label: "Item", width: 150, align: "left" },
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
        { label: "Image", width: 120, align: "center" },
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
        { label: "Action", width: 110, align: "center" },
    ];
    function cn(...classes: Array<string | false | null | undefined>) {
        return classes.filter(Boolean).join(" ");
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

    function formatCompactNumber(value: unknown, maxDecimals = 2) {
        const num = Number(value);
        if (!Number.isFinite(num)) return "0";

        return new Intl.NumberFormat("en-IN", {
            maximumFractionDigits: maxDecimals,
        }).format(Number(num.toFixed(maxDecimals)));
    }

    const parentMinWidth = parentColumns.reduce(
        (sum, column) => sum + column.width,
        0
    );

    const childMinWidth = childColumns.reduce(
        (sum, column) => sum + column.width,
        0
    );


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
                String(row.category ?? "")
                    .toLowerCase()
                    .includes(query) ||

                String(row.code ?? "")
                    .toLowerCase()
                    .includes(query) ||

                String(row.purity ?? "")
                    .toLowerCase()
                    .includes(query) ||
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
        <>
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
                                            "h-[56px] whitespace-nowrap border-r border-black px-5 text-[15px] font-semibold leading-none text-white",
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
                                                        className="sticky left-0 z-[2] bg-erp-bg "
                                                        style={{
                                                            width: parentViewportWidth
                                                                ? `${parentViewportWidth}px`
                                                                : "100%",
                                                            maxWidth: parentViewportWidth
                                                                ? `${parentViewportWidth}px`
                                                                : "100%",
                                                        }}
                                                    >

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
                                                                                        "h-[48px] whitespace-nowrap border-b border-r border-erp-border px-5 text-[14px] font-semibold text-erp-text",
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
                                                                                formatCompactNumber(
                                                                                    article.quantity,
                                                                                    0
                                                                                ),
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
                                                                                    <td className="border-b border-r border-erp-border px-4 py-3">
                                                                                        <div className="flex flex-col items-center gap-2">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                    openImagePreview(
                                                                                                        [article.image || FALLBACK_IMAGE],
                                                                                                        0
                                                                                                    )
                                                                                                }
                                                                                            >
                                                                                                <div className="relative h-8 w-20 overflow-hidden rounded-md">
                                                                                                    <Image
                                                                                                        src={article.image_url || article.image || FALLBACK_IMAGE}
                                                                                                        alt={article.article}
                                                                                                        fill
                                                                                                        className="object-contain"
                                                                                                    />
                                                                                                </div>
                                                                                            </button>

                                                                                            <label className="cursor-pointer text-[11px] text-blue-600 underline">
                                                                                                {uploadingImageId === article.id
                                                                                                    ? "Uploading..."
                                                                                                    : "Edit Image"}

                                                                                                <input
                                                                                                    type="file"
                                                                                                    accept="image/*"
                                                                                                    hidden
                                                                                                    onChange={(e) => {
                                                                                                        const file = e.target.files?.[0];

                                                                                                        if (!file) return;

                                                                                                        handleImageUpload(
                                                                                                            String(article.item_id || article.id),
                                                                                                            file
                                                                                                        );
                                                                                                    }}
                                                                                                />
                                                                                            </label>
                                                                                        </div>
                                                                                    </td>
                                                                                    {values.map((value, index) => (

                                                                                        <td
                                                                                            key={`${article.id}-${index}`}
                                                                                            className="h-[54px] border-b border-r border-erp-border px-5"
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

                                                                                    <td className="h-[54px] border-b border-erp-border px-5">

                                                                                        <div className="flex items-center justify-center gap-2">
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => setPricingItem(article)}
                                                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-erp-full text-erp-primary transition hover:bg-erp-primary-soft hover:text-erp-primary-hover"
                                                                                                title="Edit stock pricing"
                                                                                            >
                                                                                                <Pencil className="h-4 w-4" />

                                                                                            </button>

                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    const itemId =
                                                                                                        Number(article.item_id) ||
                                                                                                        Number(article.itemId) ||
                                                                                                        Number(article.id);

                                                                                                    if (!itemId) return;

                                                                                                    router.push(`/head-office/tracking/${itemId}`);
                                                                                                }}
                                                                                                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-700"
                                                                                                title="Track Item"
                                                                                            >
                                                                                                Track
                                                                                            </button>
                                                                                        </div>
                                                                                    </td>
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

            <EditStockPricingModal
                open={!!pricingItem}
                item={pricingItem}
                onClose={() => setPricingItem(null)}
                onUpdated={async () => {
                    setPricingItem(null);
                    await onPricingUpdated();
                }}
            />
        </>
    );
}