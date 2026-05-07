"use client";

import { useCallback, useMemo, useState } from "react";
import { CheckCircle2, Loader2, ScanLine } from "lucide-react";
import BillingHeader from "./BillingHeader";
import BillingSearchBar from "./BillingSearchBar";
import BillingCustomerFields from "./BillingCustomerFields";
import BillingItemsCard from "./BillingItemsCard";
import BillSummaryCard from "./BillSummaryCard";
import DesktopBillingScannerReceiver from "./DesktopBillingScannerReceiver";
import type { LiveScannedBillingItem } from "../live-scanner-types";
import { scanBillingItemByCode } from "../billing-api";
import { PRODUCT_DB, type Product } from "../../data/billing-data";
import {
  formatCurrency,
  formatWeight,
} from "../../utils/billing-utils";

type CartItem = Product & {
  qty: number;
  item_id?: number | string | null;
  raw_qr_value?: string;
  scanned_raw?: LiveScannedBillingItem;
  available_qty?: number;
  purity?: string | null;
  metal_type?: string | null;
  gross_weight?: number;
  net_weight?: number;
  rate?: number;
  making_charge_percent?: number;
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
  const weight = toNumber(item.net_weight ?? item.weight, 0);
  const rate = toNumber(item.rate ?? item.sale_rate, 0);

  const metalValue =
    item.metal_value !== undefined
      ? toNumber(item.metal_value)
      : rate * weight;

  const makingCharges =
    item.making_charge_value !== undefined
      ? toNumber(item.making_charge_value)
      : (metalValue * toNumber(item.making_charge_percent, 0)) / 100;

  return {
    id: toNumber(item.item_id || item.id, Date.now()),
    item_id: item.item_id || item.id || null,
    code: code || `QR-${Date.now()}`,
    name:
      item.item_name ||
      item.description ||
      item.details ||
      item.name ||
      code ||
      "Scanned Item",
    metalValue,
    makingCharges,
    weight,
    qty: toNumber(item.qty, 1),
    raw_qr_value: item.raw_qr_value,
    scanned_raw: item,
    available_qty: toNumber(item.available_qty, 1),
    purity: item.purity || null,
    metal_type: item.metal_type || null,
    gross_weight: toNumber(item.gross_weight, 0),
    net_weight: toNumber(item.net_weight, weight),
    rate,
    making_charge_percent: toNumber(item.making_charge_percent, 0),
  };
}

export default function BillingPageContent() {
  const [query, setQuery] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<CartItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");
  const [lastScannedItem, setLastScannedItem] =
    useState<LiveScannedBillingItem | null>(null);

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

  const addScannedItemToCart = useCallback(
    (scannedItem: LiveScannedBillingItem) => {
      const cartItem = mapScannedItemToCartItem(scannedItem);

      setItems((prev) => {
        const existing = prev.find(
          (item) =>
            item.code.toLowerCase() === cartItem.code.toLowerCase() ||
            (!!cartItem.item_id &&
              String(item.item_id) === String(cartItem.item_id))
        );

        if (existing) {
          return prev.map((item) => {
            const matched =
              item.code.toLowerCase() === cartItem.code.toLowerCase() ||
              (!!cartItem.item_id &&
                String(item.item_id) === String(cartItem.item_id));

            if (!matched) return item;

            const maxQty = toNumber(item.available_qty, 999999);
            const nextQty = Math.min(item.qty + cartItem.qty, maxQty);

            return {
              ...item,
              qty: nextQty,
              scanned_raw: scannedItem,
              raw_qr_value: scannedItem.raw_qr_value,
            };
          });
        }

        return [...prev, cartItem];
      });

      setLastScannedItem(scannedItem);
      setScanError("");
      setQuery("");
      setShowSuggestions(false);
    },
    []
  );

  const handleLiveScannedItem = useCallback(
    (scannedItem: LiveScannedBillingItem) => {
      addScannedItemToCart(scannedItem);
    },
    [addScannedItemToCart]
  );

  async function scanCodeFromDesktop(code: string) {
    try {
      setScanLoading(true);
      setScanError("");

      const realItem = await scanBillingItemByCode(code);
      addScannedItemToCart(realItem);
    } catch (error: any) {
      setScanError(error?.message || "Failed to scan item");
    } finally {
      setScanLoading(false);
    }
  }

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleanQuery = query.trim();
    if (!cleanQuery || scanLoading) return;

    await scanCodeFromDesktop(cleanQuery);
  }

  function removeProduct(code: string) {
    setItems((prev) => prev.filter((item) => item.code !== code));
  }

  function increaseQty(code: string) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.code !== code) return item;

        const maxQty = toNumber(item.available_qty, 999999);
        return {
          ...item,
          qty: Math.min(item.qty + 1, maxQty),
        };
      })
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

  function createBill() {
    const payload = {
      customerName,
      customerPhone,
      items: items.map((item) => ({
        item_id: item.item_id,
        product_code: item.code,
        item_name: item.name,
        qty: item.qty,
        gross_weight: item.gross_weight,
        net_weight: item.net_weight || item.weight,
        rate: item.rate,
        metal_value: item.metalValue,
        making_charge_percent: item.making_charge_percent,
        making_charge_value: item.makingCharges,
        total_amount: (item.metalValue + item.makingCharges) * item.qty,
        scanned_raw: item.scanned_raw,
      })),
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
    alert("Bill payload ready. Connect this with create bill API.");
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

      {scanLoading ? (
        <div className="mx-auto mb-4 flex w-full max-w-[1600px] items-center gap-3 rounded-[18px] border border-[#DBEAFE] bg-[#EFF6FF] px-4 py-3 text-[14px] font-semibold text-[#1D4ED8]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Fetching item from backend...
        </div>
      ) : null}

      {scanError ? (
        <div className="mx-auto mb-4 w-full max-w-[1600px] rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
          {scanError}
        </div>
      ) : null}

      {lastScannedItem ? (
        <ScanSummaryCard item={lastScannedItem} />
      ) : null}

      <BillingCustomerFields
        customerName={customerName}
        customerPhone={customerPhone}
        setCustomerName={setCustomerName}
        setCustomerPhone={setCustomerPhone}
      />

      <div className="mx-auto w-full max-w-[1600px]">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_370px]">
          <div className="min-w-0">
            <BillingItemsCard
              items={items}
              totalItems={totalItems}
              totalWeight={totalWeight}
              onTryScan={() => {
                const input = document.querySelector<HTMLInputElement>(
                  'input[placeholder*="Scan or enter"]'
                );
                input?.focus();
              }}
              onIncrease={increaseQty}
              onDecrease={decreaseQty}
              onRemove={removeProduct}
            />
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
            onClearAll={() => {
              setItems([]);
              setLastScannedItem(null);
              setScanError("");
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ScanSummaryCard({ item }: { item: LiveScannedBillingItem }) {
  const name =
    item.item_name || item.description || item.name || "Scanned Item";

  const code =
    item.product_code || item.article_code || item.sku_code || item.code || "-";

  return (
    <div className="mx-auto mb-4 w-full max-w-[1600px] rounded-[26px] border border-[#BBF7D0] bg-white p-4 shadow-[0px_8px_24px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Item Scanned Successfully
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#F5F3FF] text-[#7C3AED]">
              <ScanLine className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-[20px] font-semibold tracking-[-0.03em] text-[#111827]">
                {name}
              </h3>
              <p className="mt-1 break-all text-[13px] font-medium text-[#667085]">
                {code}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[620px]">
          <MiniStat label="Purity" value={item.purity || "-"} />
          <MiniStat
            label="Net Wt"
            value={formatWeight(toNumber(item.net_weight))}
          />
          <MiniStat
            label="Rate"
            value={formatCurrency(toNumber(item.rate || item.sale_rate))}
          />
          <MiniStat
            label="Total"
            value={formatCurrency(toNumber(item.total_amount))}
          />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-[#F8FAFC] px-4 py-3">
      <p className="text-[12px] font-medium text-[#667085]">{label}</p>
      <p className="mt-1 truncate text-[15px] font-bold text-[#111827]">
        {value}
      </p>
    </div>
  );
}