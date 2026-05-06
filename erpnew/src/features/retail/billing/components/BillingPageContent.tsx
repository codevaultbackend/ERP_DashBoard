"use client";

import { useCallback, useMemo, useState } from "react";
import BillingHeader from "./BillingHeader";
import BillingSearchBar from "./BillingSearchBar";
import BillingCustomerFields from "./BillingCustomerFields";
import BillingItemsCard from "./BillingItemsCard";
import BillSummaryCard from "./BillSummaryCard";
import DesktopBillingScannerReceiver from "../../../../features/retail/billing/components/DesktopBillingScannerReceiver";
import type { LiveScannedBillingItem } from "../../../../features/retail/billing/live-scanner-types";
import {
  PRODUCT_DB,
  type Product,
} from "../../../../features/retail/data/billing-data";

type CartItem = Product & {
  qty: number;
  item_id?: number | null;
  raw_qr_value?: string;
  scanned_raw?: LiveScannedBillingItem;
};

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function getScannedCode(item: LiveScannedBillingItem) {
  return String(
    item.product_code ||
      item.article_code ||
      item.sku_code ||
      item.code ||
      item.barcode ||
      item.raw_qr_value ||
      item.item_id ||
      ""
  ).trim();
}

function mapScannedItemToCartItem(item: LiveScannedBillingItem): CartItem {
  const code = getScannedCode(item);

  const matchedProduct = PRODUCT_DB.find(
    (product) => product.code.toLowerCase() === code.toLowerCase()
  );

  if (matchedProduct) {
    return {
      ...matchedProduct,
      qty: toNumber(item.qty, 1),
      item_id: item.item_id || matchedProduct.id,
      raw_qr_value: item.raw_qr_value,
      scanned_raw: item,
    };
  }

  const rate = toNumber(item.rate, 0);
  const weight = toNumber(item.net_weight ?? item.weight, 0);
  const makingPercent = toNumber(item.making_charge_percent, 0);

  const metalValue = rate > 0 && weight > 0 ? rate * weight : 0;
  const makingCharges =
    metalValue > 0 && makingPercent > 0
      ? (metalValue * makingPercent) / 100
      : 0;

  return {
    id: toNumber(item.item_id || item.id, Date.now()),
    item_id: item.item_id || item.id || null,
    code: code || `QR-${Date.now()}`,
    name:
      item.description ||
      item.details ||
      item.item_name ||
      item.name ||
      code ||
      "Scanned Item",
    metalValue,
    makingCharges,
    weight,
    qty: toNumber(item.qty, 1),
    raw_qr_value: item.raw_qr_value,
    scanned_raw: item,
  };
}

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

  const handleLiveScannedItem = useCallback((scannedItem: LiveScannedBillingItem) => {
    const cartItem = mapScannedItemToCartItem(scannedItem);

    setItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.code.toLowerCase() === cartItem.code.toLowerCase() ||
          (!!cartItem.item_id && item.item_id === cartItem.item_id)
      );

      if (existing) {
        return prev.map((item) => {
          const matched =
            item.code.toLowerCase() === cartItem.code.toLowerCase() ||
            (!!cartItem.item_id && item.item_id === cartItem.item_id);

          if (!matched) return item;

          return {
            ...item,
            qty: item.qty + cartItem.qty,
            scanned_raw: scannedItem,
            raw_qr_value: scannedItem.raw_qr_value,
          };
        });
      }

      return [...prev, cartItem];
    });
  }, []);

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

      <DesktopBillingScannerReceiver onItemReceived={handleLiveScannedItem} />

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