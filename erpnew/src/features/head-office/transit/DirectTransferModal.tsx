"use client";

import { X, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import {
    getDistrictStores,
    type DistrictStoreApi,
} from "@/features/head-office/request/request/api/district-request-api";

import { scanBillingItemByCode } from "@/features/retail/billing/billing-api";
import stockTransferApi from "@/features/head-office/transit/stockTransferApi";

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
    sku_code?: string;

    qty: number;
    weight: number;
    rate: number;

    item_name?: string;
    article_code?: string;
    category?: string;
    metal_type?: string;
    purity?: string;
    hsn_code?: string;

    gross_weight?: number;
    net_weight?: number;
    stone_weight?: number;
    stone_amount?: number;

    making_charge?: number;
    purchase_rate?: number;
    sale_rate?: number;

    subcategory?: string;
    details?: string;
    unit?: string;
};

export default function DirectTransferModal({
    open,
    onClose,
    onSubmit,
}: Props) {
    const [districts, setDistricts] = useState<DistrictStoreApi[]>([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const [items, setItems] = useState<TransferItem[]>([]);

    const [form, setForm] = useState<TransferItem>({
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

    const [searchCode, setSearchCode] = useState("");
    const [loadingItem, setLoadingItem] = useState(false);

    const [itemFound, setItemFound] = useState(false);

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const data = await getDistrictStores();
                setDistricts(data);
            } catch (error) {
                console.error(error);
            }
        };

        if (open) fetchDistricts();
    }, [open]);

    const handleSearchItem = async () => {
        if (!searchCode.trim()) return;

        try {
            setLoadingItem(true);

            const data = await scanBillingItemByCode(searchCode);

            setForm({
                item_id: data.item_id,
                sku_code: data.sku_code,

                item_name: data.item_name,
                article_code: data.article_code,
                category: data.category,
                metal_type: data.metal_type,
                purity: data.purity,
                hsn_code: data.hsn_code,

                qty: 1,
                weight:
                    data.weight ??
                    data.net_weight ??
                    data.gross_weight ??
                    0,

                rate:
                    data.sale_rate ??
                    data.rate ??
                    0,

                gross_weight: data.gross_weight,
                net_weight: data.net_weight,
                stone_weight: data.stone_weight,
                stone_amount: data.stone_amount,
                making_charge: data.making_charge,
                purchase_rate: data.purchase_rate,
                sale_rate: data.sale_rate,
                subcategory: data.subcategory,
                details: data.details,
                unit: data.unit,
            });

            setItemFound(true);
        } catch {
            setItemFound(false);

            setForm((prev) => ({
                ...prev,
                item_id: undefined,
                sku_code: searchCode, // keep whatever user entered
            }));

            alert(
                "Item not found. You can continue by entering the item details manually."
            );
        }
    };

    const handleAddItem = () => {
        const isManual = !itemFound;

        // Common validation
        if (!form.qty || Number(form.qty) <= 0) {
            alert("Please enter quantity.");
            return;
        }

        // Manual item validation
        if (isManual) {
            if (
                !form.item_name?.trim() ||
                !form.category?.trim()
            ) {
                alert("Please fill all required item details.");
                return;
            }
        }

        const payloadItem: TransferItem = {
            ...form,

            // Only send item_id when fetched from inventory
            item_id: itemFound ? form.item_id : undefined,

            // Keep manual SKU/item code
            sku_code: form.sku_code?.trim() || searchCode.trim(),

            qty: Number(form.qty),
            weight: Number(form.weight || 0),
            rate: Number(form.rate || 0),
        };

        setItems((prev) => [...prev, payloadItem]);

        // Reset form
        setForm({
            item_id: undefined,
            sku_code: "",
            item_name: "",
            category: "",
            article_code: "",
            hsn_code: "",
            qty: 0,
            rate: 0,
            weight: 0,
            purity: "",
            metal_type: "",
            gross_weight: undefined,
            net_weight: undefined,
            stone_weight: undefined,
            stone_amount: undefined,
            making_charge: undefined,
            purchase_rate: undefined,
            sale_rate: undefined,
            subcategory: "",
            details: "",
            unit: "",
        });

        setSearchCode("");
        setItemFound(false);
    };

    const handleContinue = () => {
        if (!selectedDistrict) {
            alert("Select district");
            return;
        }

        if (!items.length) {
            alert("Add items first");
            return;
        }

        onSubmit(items, Number(selectedDistrict));
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-[512px] max-h-[90vh] overflow-y-auto rounded-[32px] bg-white">

                {/* HEADER */}
                <div className="flex items-center justify-between  px-5 py-3">
                    <h2 className="text-[18px] font-semibold">
                        Direct Transfer
                    </h2>

                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                <div className="p-4">

                    {/* SEARCH */}
                    <div className="mb-5 flex gap-3 max-[768px]:flex-col justify-between">
                        <input
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                            placeholder="Enter SKU / Barcode"
                            className="w-full h-9 bg-[#F3F3F5]  rounded-xl px-3 max-w-[363px]"
                        />

                        <button
                            onClick={handleSearchItem}
                            className="px-5 h-9 bg-black text-white rounded-xl"
                        >
                            {loadingItem ? "..." : "Search"}
                        </button>
                    </div>

                    {/* ITEM FORM */}
                    <div className="grid grid-cols-3 max-[768px]:grid-cols-2 gap-2.5" >
                        <Field
                            label="SKU Code / Item Code"
                            value={form.sku_code ?? ""}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    sku_code: e.target.value,
                                }))
                            }
                            readOnly={itemFound}
                        />

                        <Field
                            label="Item Name"
                            value={form.item_name}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    item_name: e.target.value,
                                }))
                            }
                            readOnly={itemFound}
                        />

                        <Field
                            label="Category"
                            value={form.category}
                            onChange={(e) =>
                                setForm((p) => ({
                                    ...p,
                                    category: e.target.value,
                                }))
                            }
                            readOnly={itemFound}
                        />
                        <div className="mb-3 flex flex-col gap-0.5">
                            <label className="text-sm">Metal Type *</label>

                            <select
                                value={form.metal_type ?? ""}
                                disabled={itemFound}
                                onChange={(e) =>
                                    setForm((p) => ({
                                        ...p,
                                        metal_type: e.target.value,
                                    }))
                                }
                                className="w-full h-9 bg-[#F3F3F5]  rounded-xl px-3 max-w-[163px]"
                            >
                                <option value="">Select Metal</option>
                                <option value="Gold">Gold</option>
                                <option value="Silver">Silver</option>
                                <option value="Diamond">Diamond</option>
                                <option value="Platinum">Platinum</option>
                            </select>
                        </div>

                        <Field
                            label="Quantity"
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
                        <div className="mt-5">
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="w-full h-9 bg-[#F3F3F5]  rounded-xl px-3 max-w-[163px] !border-0"
                            >
                                <option value="" >Select District</option>
                                {districts.map((d) => (
                                    <option key={d.id} value={d.id} className="shadow-erp-card !border-0 outline-0">
                                        {d.store_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ITEMS */}
                    {items.length > 0 && (
                        <div className="mt-4">
                            {items.map((item, i) => (
                                <div key={i} className="p-3 border rounded-xl">
                                    <p>{item.item_name}</p>
                                    <p>Qty: {item.qty}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FOOTER */}
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleAddItem}
                            className="flex items-center justify-center w-[168px] gap-1.5 bg-black text-white h-9 rounded-xl"
                        >
                            <Plus size={16} /> Add Item
                        </button>

                        <button
                            onClick={handleContinue}
                            className="flex-1 bg-green-600 text-white h-10 rounded-xl"
                        >
                            Continue
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

/* INPUT */
function Field({
    label,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
}) {
    return (
        <div className="mb-3 flex flex-col gap-0.5 ">
            <label className="text-sm">{label}</label>
            <input
                {...props}
                className="w-full h-9 bg-[#F3F3F5]  rounded-xl px-3 max-w-[163px]"
            />
        </div>
    );
}