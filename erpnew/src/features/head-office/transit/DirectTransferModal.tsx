"use client";

import { X, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import {
    getDistrictStores,
    type DistrictStoreApi,
} from "@/features/head-office/request/request/api/district-request-api";

type Props = {
    open: boolean;
    onClose: () => void;

    onSubmit: (
        items: TransferItem[],
        districtId: number
    ) => void;
};
type TransferItem = {
    item_id?: number;

    item_name: string;
    category: string;
    metal_type: string;

    qty: number;

    weight?: number;
    rate?: number;

    purity?: string;
    hsn_code?: string;

    article_code?: string;
    sku_code?: string;
};

export default function DirectTransferModal({
    open,
    onClose,
    onSubmit,
}: Props) {

    const [districts, setDistricts] =
        useState<DistrictStoreApi[]>([]);

    const [selectedDistrict, setSelectedDistrict] =
        useState("");

    const [items, setItems] =
        useState<TransferItem[]>([]);

    const [form, setForm] =
        useState<TransferItem>({
            item_name: "",
            category: "",
            article_code: "",
            hsn_code: "",

            qty: 0,

            rate: 0,

            purity: "",

            weight: 0,

            metal_type: "",
        });
    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const data =
                    await getDistrictStores();

                setDistricts(data);
            } catch (error) {
                console.error(error);
            }
        };

        if (open) {
            fetchDistricts();
        }
    }, [open]);
    const handleAddItem = () => {
        if (
            !form.item_name ||
            !form.category ||
            !form.metal_type ||
            !form.qty
        ) {
            alert(
                "Please fill required fields"
            );

            return;
        }

        setItems((prev) => [
            ...prev,
            form,
        ]);

        setForm({
            item_name: "",
            category: "",
            article_code: "",
            hsn_code: "",

            qty: 0,

            rate: 0,

            purity: "",

            weight: 0,

            metal_type: "",
        });
    };
    const handleContinue = () => {
        if (!selectedDistrict) {
            alert(
                "Select destination district"
            );

            return;
        }

        if (!items.length) {
            alert(
                "Add at least one item"
            );

            return;
        }

        const district = districts.find(
            (d) => String(d.id) === selectedDistrict
        );

        onSubmit(
            items,
            Number(selectedDistrict)
        );
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
            <div className="w-full max-w-[512px] max-h-[90vh] overflow-y-auto rounded-[32px] bg-white shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#EEF2F7] px-5 py-3">
                    <h2 className="text-[18px] font-semibold text-[#0A0A0A] leading-[18px] tracking-[-0.44px]">
                        Direct Transfer
                    </h2>

                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
                    >
                        <X className="h-5 w-5 text-[#475569]" />
                    </button>
                </div>

                <div className="p-4">
                    {/* Item Details Card */}
                    <div className="rounded-[24px] bg-[#F9FAFB] p-4 border-[1px] border-[#00000000]">
                        <h3 className="mb-4 text-[16px] font-semibold text-[#000000]">
                            Item Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

                            <Field
                                label="Item Name"
                                value={form.item_name}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        item_name: e.target.value,
                                    }))
                                }
                            />

                            <Field
                                label="Category"
                                value={form.category}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        category: e.target.value,
                                    }))
                                }
                            />

                            <Field
                                label="Item Code"
                                value={form.article_code}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        article_code: e.target.value,
                                    }))
                                }
                            />

                            <Field
                                label="HSN Code"
                                value={form.hsn_code}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        hsn_code: e.target.value,
                                    }))
                                }
                            />

                            <Field
                                label="Quantity"
                                type="number"
                                value={form.qty || ""}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        qty: Number(e.target.value),
                                    }))
                                }
                            />

                            <Field
                                label="Purchase Price"
                            />

                            <Field
                                label="Selling Price"
                            />

                            <Field
                                label="Making Charge"
                                type="number"
                                value={form.rate || ""}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        rate: Number(e.target.value),
                                    }))
                                }
                            />

                            <Field
                                label="Purity"
                                value={form.purity}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        purity: e.target.value,
                                    }))
                                }
                            />

                            <Field
                                label="Net Weight"
                                type="number"
                                value={form.weight || ""}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        weight: Number(e.target.value),
                                    }))
                                }
                            />

                            <Field
                                label="Stone Weight"
                            />

                            <SelectField
                                label="Metal Type"
                                value={form.metal_type}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        metal_type: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    {/* District */}
                    <div className="mt-6">
                        <label className="mb-2 block text-sm font-[400] text-[#000000]">
                            Destination District
                        </label>

                        <select
                            value={selectedDistrict}
                            onChange={(e) =>
                                setSelectedDistrict(
                                    e.target.value
                                )
                            }
                            className="h-[36px] w-full rounded-[16px] border border-[#E2E8F0] bg-[#F3F3F5] px-4 text-[15px] outline-none focus:border-[#0F172A] text-[#000000]"
                        >
                            <option value="">
                                Select District
                            </option>

                            {districts.map((district) => (
                                <option
                                    key={district.id}
                                    value={district.id}
                                >
                                    {district.store_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {items.length > 0 && (
                        <div className="mt-2 rounded-[20px]  bg-white p-4">
                            <h4 className="mb-4 font-semibold">
                                Added Items
                            </h4>

                            <div className="space-y-3">
                                {items.map(
                                    (item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {item.item_name}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    Qty: {item.qty}
                                                </p>
                                            </div>

                                            <div className="text-sm text-slate-500">
                                                {item.category}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 flex gap-4">
                        <button
                            type="button"
                            onClick={handleAddItem}

                            className="flex h-[42px] flex-1 items-center justify-center gap-2 rounded-[8px] bg-[#020617] text-[12px] font-[500] text-white transition hover:opacity-90"
                        >
                            <Plus className="h-4 w-4" />
                            Add Item
                        </button>


                        <button
                            type="button"
                            onClick={handleContinue}
                            className="h-[42px] flex-1 whitespace-nowrap rounded-[8px] bg-[#16A34A] text-[12px] font-[500] text-white transition hover:opacity-90"
                        >
                            Add Driver Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-[400] text-[#334155] !whitespace-nowrap">
                {label}
            </label>

            <input
                {...props}
                className="h-[36px] w-full rounded-[14px] bg-[#F3F3F5] px-4 outline-none focus:border-[#0F172A]"
                placeholder=""
            />
        </div>
    );
}

function SelectField({
    label,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-[#334155] !whitespace-nowrap">
                {label}
            </label>

            <select
                {...props}
                className="h-[36px] w-full rounded-[14px]  bg-[#F3F3F5] px-4 outline-none focus:border-[#0F172A]"
            >
                <option value="">
                    Select
                </option>

                <option value="Gold">
                    Gold
                </option>

                <option value="Silver">
                    Silver
                </option>

                <option value="Diamond">
                    Diamond
                </option>
            </select>
        </div>
    );
}