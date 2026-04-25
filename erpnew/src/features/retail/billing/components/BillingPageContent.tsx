"use client";

import { useMemo, useState } from "react";
import BillingHeader from "./BillingHeader";
import BillingSearchBar from "./BillingSearchBar";
import BillingCustomerFields from "./BillingCustomerFields";
import BillingItemsCard from "./BillingItemsCard";
import BillSummaryCard from "./BillSummaryCard";
import { PRODUCT_DB, type Product } from "../../../../features/retail/data/billing-data";

type CartItem = Product & {
    qty: number;
};

export default function BillingPageContent() {
    const [query, setQuery] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [items, setItems] = useState<CartItem[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        return PRODUCT_DB.filter(
            (item) =>
                item.code.toLowerCase().includes(q) ||
                item.name.toLowerCase().includes(q)
        ).slice(0, 6);
    }, [query]);

    const totalItems = useMemo(
        () => items.reduce((acc, item) => acc + item.qty, 0),
        [items]
    );

    const totalWeight = useMemo(
        () => items.reduce((acc, item) => acc + item.weight * item.qty, 0),
        [items]
    );

    const metalValue = useMemo(
        () => items.reduce((acc, item) => acc + item.metalValue * item.qty, 0),
        [items]
    );

    const makingCharges = useMemo(
        () => items.reduce((acc, item) => acc + item.makingCharges * item.qty, 0),
        [items]
    );

    const gst = useMemo(
        () => (metalValue + makingCharges) * 0.03,
        [metalValue, makingCharges]
    );

    const grandTotal = useMemo(
        () => metalValue + makingCharges + gst,
        [metalValue, makingCharges, gst]
    );

    function addProduct(product: Product) {
        setItems((prev) => {
            const existing = prev.find((item) => item.code === product.code);

            if (existing) {
                return prev.map((item) =>
                    item.code === product.code ? { ...item, qty: item.qty + 1 } : item
                );
            }

            return [...prev, { ...product, qty: 1 }];
        });

        setQuery("");
        setShowSuggestions(false);
    }

    function removeProduct(code: string) {
        setItems((prev) => prev.filter((item) => item.code !== code));
    }

    function increaseQty(code: string) {
        setItems((prev) =>
            prev.map((item) =>
                item.code === code ? { ...item, qty: item.qty + 1 } : item
            )
        );
    }

    function decreaseQty(code: string) {
        setItems((prev) =>
            prev
                .map((item) =>
                    item.code === code ? { ...item, qty: item.qty - 1 } : item
                )
                .filter((item) => item.qty > 0)
        );
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();

        const matched = PRODUCT_DB.find(
            (item) => item.code.toLowerCase() === query.trim().toLowerCase()
        );

        if (matched) addProduct(matched);
    }

    function createBill() {
        const payload = {
            customerName,
            customerPhone,
            items,
            summary: {
                totalItems,
                totalWeight,
                metalValue,
                makingCharges,
                gst,
                grandTotal,
            },
        };

        console.log("Create Bill Payload:", payload);
        alert("Bill created successfully");
    }

    return (
        <div className="min-h-screen bg-[#F5F7FB] p-1">
            <BillingHeader />
            <BillingSearchBar
                query={query}
                setQuery={setQuery}
                showSuggestions={showSuggestions}
                setShowSuggestions={setShowSuggestions}
                suggestions={suggestions}
                onSubmit={handleSearchSubmit}
                onSelectProduct={addProduct}
            />

            <BillingCustomerFields
                customerName={customerName}
                customerPhone={customerPhone}
                setCustomerName={setCustomerName}
                setCustomerPhone={setCustomerPhone}
            />
            <div className="mx-auto w-full max-w-[1600px]">

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
                    <div className="min-w-0">
                        <div className="flex flex-col gap-4">
                            <BillingItemsCard
                                items={items}
                                totalItems={totalItems}
                                totalWeight={totalWeight}
                                onTryScan={() => addProduct(PRODUCT_DB[0])}
                                onIncrease={increaseQty}
                                onDecrease={decreaseQty}
                                onRemove={removeProduct}
                            />
                        </div>
                    </div>

                    <BillSummaryCard
                        items={items}
                        metalValue={metalValue}
                        makingCharges={makingCharges}
                        gst={gst}
                        grandTotal={grandTotal}
                        totalItems={totalItems}
                        totalWeight={totalWeight}
                        onCreateBill={createBill}
                        onClearAll={() => setItems([])}
                    />
                </div>
            </div>
        </div>
    );
}