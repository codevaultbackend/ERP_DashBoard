"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    X,
    Plus,
    ChevronDown,
    Search,
} from "lucide-react";

import {
    getRetailStoresUnderDistrict,
    type DistrictRetailStoreApi,
} from "@/features/head-office/request/request/api/district-request-api";

import { scanBillingItemByCode } from "@/features/retail/billing/billing-api";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (
        items: TransferItem[],
        retailId: number
    ) => void;
};

type TransferItem = {
    item_id?: number;
    item_name: string;
    sku_code: string;
    qty: number;
    weight: number;
    rate: number;
};

export default function DirectTransferModal({
    open,
    onClose,
    onSubmit,
}: Props) {

    const [mounted, setMounted] = useState(false);

    const [retailStores, setRetailStores] =
        useState<DistrictRetailStoreApi[]>([]);

    const [selectedRetail, setSelectedRetail] =
        useState("");

    const [items, setItems] =
        useState<TransferItem[]>([]);

    const [fetchingItem, setFetchingItem] =
        useState(false);

    const [form, setForm] =
        useState<TransferItem>({
            item_name: "",
            sku_code: "",
            qty: 0,
            weight: 0,
            rate: 0,
        });

    // Needed because document isn't available during SSR
    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                const stores =
                    await getRetailStoresUnderDistrict();
                setRetailStores(stores);
            } catch (err) {
                console.error(err);
                setRetailStores([]);
            }
        })();
    }, [open]);

    const handleFetchSku = async () => {
        if (!form.sku_code.trim()) {
            alert("Enter SKU Code");
            return;
        }

        try {
            setFetchingItem(true);

            const item =
                await scanBillingItemByCode(
                    form.sku_code
                );

            setForm((prev) => ({
                ...prev,
                item_id: item.item_id,
                item_name: item.item_name || "",
                sku_code: item.sku_code || prev.sku_code,
                qty: 1,
                weight: Number(item.net_weight ?? item.weight ?? 0),
                rate: Number(item.selling_price ?? item.rate ?? 0),
            }));
        } catch (err: any) {
            alert(err.message ?? "Item not found");
        } finally {
            setFetchingItem(false);
        }
    };

    const handleAddItem = () => {
        if (!form.item_id || !form.sku_code || !form.qty) {
            alert("Please fetch an item first.");
            return;
        }

        setItems((prev) => [...prev, form]);

        setForm({
            item_name: "",
            sku_code: "",
            qty: 0,
            weight: 0,
            rate: 0,
        });
    };

    const handleContinue = () => {
        if (!selectedRetail) {
            alert("Please select a retail store.");
            return;
        }

        if (!items.length) {
            alert("Please add at least one item.");
            return;
        }

        // Reset local state right away so this modal is clean
        // the next time it's opened, then hand off to the parent.
        const itemsToSubmit = items;
        const retailIdToSubmit = Number(selectedRetail);

        onSubmit(itemsToSubmit, retailIdToSubmit);
    };

    useEffect(() => {
        if (!open) {
            setItems([]);
            setForm({
                item_name: "",
                sku_code: "",
                qty: 0,
                weight: 0,
                rate: 0,
            });
            setSelectedRetail("");
        }
    }, [open]);

    if (!open || !mounted) return null;

    const modal = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-3 sm:p-6">

            {/* MODAL */}
            <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[24px] bg-white shadow-xl flex flex-col">

                {/* HEADER */}
                <div className="flex items-center justify-between  px-4 max-[768px]:px-6 py-3">
                    <h2 className="text-lg font-semibold">
                        Direct Transfer
                    </h2>

                    <button onClick={onClose}>
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* BODY (SCROLLABLE) */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                    {/* ITEM FORM */}
                    <div className="rounded-2xl">

                        {/* GRID */}
                        <div className="grid grid-cols-3 max-[768px]:grid-cols-2 gap-4">

                            {/* SKU */}
                            <div className="sm:col-span-2 flex items-end gap-2">

                                <div className="flex-1">
                                    <label className="text-sm">SKU Code</label>
                                    <input
                                        value={form.sku_code}
                                        onChange={(e) =>
                                            setForm((p) => ({
                                                ...p,
                                                sku_code: e.target.value,
                                            }))
                                        }
                                        placeholder="SKU Code"
                                        className="!h-9 w-full bg-[#F3F3F5] border-[#00000000] border-[1px] rounded-xl px-3 mt-1"
                                    />
                                </div>

                                <button
                                    onClick={handleFetchSku}
                                    disabled={fetchingItem}
                                    className="h-9 px-4 rounded-xl bg-[#0EB517] text-white disabled:opacity-60"
                                >
                                    {fetchingItem ? "Loading..." : "Fetch"}
                                </button>

                            </div>

                            <Field
                                label="Item Name"
                                value={form.item_name}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        item_name: e.target.value,
                                    }))
                                }
                            />

                            <Field
                                label="Qty"
                                type="number"
                                value={form.qty || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        qty: Number(e.target.value),
                                    }))
                                }
                            />

                            <Field
                                label="Weight"
                                type="number"
                                value={form.weight || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        weight: Number(e.target.value),
                                    }))
                                }
                            />

                            <Field
                                label="Rate"
                                type="number"
                                value={form.rate || ""}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        rate: Number(e.target.value),
                                    }))
                                }
                            />

                        </div>

                        {/* RETAIL */}
                        <div className="mt-4">
                            <label className="text-sm font-medium">
                                Destination Store
                            </label>

                            <select
                                value={selectedRetail}
                                onChange={(e) =>
                                    setSelectedRetail(e.target.value)
                                }
                                className="w-full h-10 mt-2 rounded-xl px-3 border border-[#e5e5e5]"
                            >
                                <option value="">
                                    Select Store
                                </option>

                                {retailStores.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.store_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    {/* ITEMS */}
                    <div>
                        <h3 className="font-semibold mb-3">
                            Added Items
                        </h3>

                        {items.length === 0 ? (
                            <div className="text-sm text-gray-400  rounded-xl p-4 text-center">
                                No items added yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, i) => (
                                    <div
                                        key={i}
                                        className=" rounded-xl p-3 flex justify-between border border-[#eee]"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.item_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.sku_code}
                                            </p>
                                        </div>

                                        <div className="text-right text-sm">
                                            <p>Qty: {item.qty}</p>
                                            <p>₹{item.rate}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* FOOTER (STICKY) */}
                <div className=" p-4 flex gap-3 border-t">
                    <button
                        onClick={handleAddItem}
                        className="flex-1 bg-black text-white rounded-xl h-11"
                    >
                        <Plus className="inline h-4 w-4 mr-1" />
                        Add Item
                    </button>

                    <button
                        onClick={handleContinue}
                        className="flex-1 bg-green-600 text-white rounded-xl h-11"
                    >
                        Continue
                    </button>
                </div>

            </div>
        </div>
    );

    // Render into document.body so this modal is never affected by
    // a parent's transform/overflow/z-index stacking context.
    return createPortal(modal, document.body);
}

/* FIELD */
function Field({
    label,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
}) {
    return (
        <div>
            <label className="text-sm">{label}</label>
            <input
                {...props}
                className="w-full h-9 mt-1 rounded-xl px-3 bg-[#F3F3F5] border-[#00000000] border-[1px]"
            />
        </div>
    );
}