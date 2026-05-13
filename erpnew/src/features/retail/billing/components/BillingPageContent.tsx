"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, ScanLine, X } from "lucide-react";
import BillingHeader from "./BillingHeader";
import BillingSearchBar from "./BillingSearchBar";
import BillingCustomerFields from "./BillingCustomerFields";
import BillingItemsCard from "./BillingItemsCard";
import BillSummaryCard from "./BillSummaryCard";
import DesktopBillingScannerReceiver from "./DesktopBillingScannerReceiver";
import CreateInvoiceModal, {
  type InvoiceCustomerForm,
} from "./CreateInvoiceModal";
import type { LiveScannedBillingItem } from "../live-scanner-types";
import {
  createBillingInvoice,
  scanBillingItemByCode,
  type CreateBillItemPayload,
} from "../billing-api";
import { PRODUCT_DB, type Product } from "../../data/billing-data";
import { formatCurrency, formatWeight } from "../../utils/billing-utils";

const BILLING_SESSION_STORAGE_KEY = "erp_billing_active_session_v1";

export type BillingCartItem = {
  id: number;
  code: string;
  name: string;
  metalValue: number;
  makingCharges: number;
  weight: number;
  qty: number;

  item_id?: number | string | null;
  raw_qr_value?: string;
  scanned_raw?: LiveScannedBillingItem;
  available_qty?: number;

  purity?: string | null;
  metal_type?: string | null;
  gross_weight?: number;
  net_weight?: number;
  stone_weight?: number;
  rate?: number;
  making_charge_percent?: number;
  hsn_code?: string | null;
  unit?: string | null;
};

type StoredBillingSession = {
  items: BillingCartItem[];
  customerName: string;
  customerPhone: string;
  lastScannedItem: LiveScannedBillingItem | null;
  updatedAt: string;
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

function mapProductToCartItem(product: Product): BillingCartItem {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    metalValue: product.metalValue,
    makingCharges: product.makingCharges,
    weight: product.weight,
    qty: 1,
    net_weight: product.weight,
  };
}

function mapScannedItemToCartItem(item: LiveScannedBillingItem): BillingCartItem {
  const code = getScannedCode(item);
  const netWeight = toNumber(item.net_weight ?? item.weight, 0);
  const grossWeight = toNumber(item.gross_weight, netWeight);
  const rate = toNumber(item.rate ?? item.sale_rate, 0);

  const metalValue =
    item.metal_value !== undefined
      ? toNumber(item.metal_value)
      : rate * netWeight;

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
    weight: netWeight,
    qty: toNumber(item.qty, 1),
    raw_qr_value: item.raw_qr_value,
    scanned_raw: item,
    available_qty: toNumber(item.available_qty, 1),
    purity: item.purity || null,
    metal_type: item.metal_type || null,
    gross_weight: grossWeight,
    net_weight: netWeight,
    stone_weight: toNumber(item.stone_weight, 0),
    rate,
    making_charge_percent: toNumber(item.making_charge_percent, 0),
    hsn_code: item.hsn_code || null,
    unit: item.unit || null,
  };
}

function readStoredBillingSession(): StoredBillingSession | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(BILLING_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as StoredBillingSession;

    if (!parsed || !Array.isArray(parsed.items)) return null;

    return {
      items: parsed.items || [],
      customerName: parsed.customerName || "",
      customerPhone: parsed.customerPhone || "",
      lastScannedItem: parsed.lastScannedItem || null,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeStoredBillingSession(session: StoredBillingSession) {
  if (typeof window === "undefined") return;

  localStorage.setItem(BILLING_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearStoredBillingSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(BILLING_SESSION_STORAGE_KEY);
}

function sanitizeText(value: string) {
  const clean = String(value || "").trim();
  return clean || null;
}

export default function BillingPageContent() {
  const hydratedRef = useRef(false);

  const [query, setQuery] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<BillingCartItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState("");
  const [lastScannedItem, setLastScannedItem] =
    useState<LiveScannedBillingItem | null>(null);

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [createBillLoading, setCreateBillLoading] = useState(false);
  const [createBillError, setCreateBillError] = useState("");
  const [billSuccess, setBillSuccess] = useState("");

  useEffect(() => {
    const stored = readStoredBillingSession();

    if (stored) {
      setItems(stored.items);
      setCustomerName(stored.customerName);
      setCustomerPhone(stored.customerPhone);
      setLastScannedItem(stored.lastScannedItem);
    }

    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;

    if (
      items.length === 0 &&
      !customerName &&
      !customerPhone &&
      !lastScannedItem
    ) {
      clearStoredBillingSession();
      return;
    }

    writeStoredBillingSession({
      items,
      customerName,
      customerPhone,
      lastScannedItem,
      updatedAt: new Date().toISOString(),
    });
  }, [items, customerName, customerPhone, lastScannedItem]);

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
    const cartItem = mapProductToCartItem(product);

    setItems((prev) => {
      const existing = prev.find((item) => item.code === cartItem.code);

      if (existing) {
        return prev.map((item) =>
          item.code === cartItem.code ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [...prev, cartItem];
    });

    setQuery("");
    setShowSuggestions(false);
    setBillSuccess("");
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
      setBillSuccess("");
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
      setBillSuccess("");

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
    setBillSuccess("");
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

  function endBillingSession() {
    setItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setLastScannedItem(null);
    setScanError("");
    setBillSuccess("");
    setInvoiceModalOpen(false);
    setCreateBillError("");
    clearStoredBillingSession();
  }

  function openCreateInvoiceModal() {
    setCreateBillError("");

    if (items.length === 0) {
      setScanError("Please scan or add at least one item before creating bill.");
      return;
    }

    setInvoiceModalOpen(true);
  }

  function buildBillItems(): CreateBillItemPayload[] {
    return items.map((item) => {
      const itemId = item.item_id || item.id;

      if (!itemId) {
        throw new Error(`item_id missing for ${item.name}`);
      }

      const rate = toNumber(item.rate);
      const netWeight = toNumber(item.net_weight || item.weight);
      const makingPercent = toNumber(item.making_charge_percent);

      if (rate <= 0) {
        throw new Error(`Invalid rate for ${item.name}`);
      }

      return {
        item_id: itemId,
        product_code: item.code,
        description: item.name,
        qty: toNumber(item.qty, 1),
        net_weight: netWeight,
        rate,
        making_charge_percent: makingPercent,
        unit: item.unit || undefined,
      };
    });
  }

  async function submitCreateInvoice(form: InvoiceCustomerForm) {
    try {
      setCreateBillLoading(true);
      setCreateBillError("");

      const billItems = buildBillItems();

      const customerPayload = {
        name: sanitizeText(form.name),
        phone: sanitizeText(form.phone || customerPhone),
        pan_card_number: sanitizeText(form.pan_card_number),
        pincode: sanitizeText(form.pincode),
        address: sanitizeText(form.address),
      };

      const hasCustomer =
        customerPayload.name ||
        customerPayload.phone ||
        customerPayload.pan_card_number ||
        customerPayload.pincode ||
        customerPayload.address;

      if (
        hasCustomer &&
        !customerPayload.name &&
        !customerPayload.phone &&
        !customerPayload.pan_card_number
      ) {
        throw new Error("Customer name, phone or PAN is required.");
      }

      const response = await createBillingInvoice({
        customer: hasCustomer ? customerPayload : null,
        items: billItems,
        paid_amount: 0,
        notes: null,
      });

      const billNumber =
        response?.data?.bill_number || response?.data?.bill_no || "created";

      setBillSuccess(`Invoice ${billNumber} created successfully.`);
      setInvoiceModalOpen(false);
      endBillingSession();
    } catch (error: any) {
      setCreateBillError(error?.message || "Failed to create invoice");
    } finally {
      setCreateBillLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9]">
      <DesktopBillingScannerReceiver onItemReceived={handleLiveScannedItem} />

      <div className="mx-auto w-full max-w-[1510px] ">
        <BillingHeader />

        <BillingSearchBar
          query={query}
          setQuery={setQuery}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          suggestions={suggestions}
          onSubmit={handleSearchSubmit}
          onSelectProduct={addProduct}
          scanLoading={scanLoading}
          onCreateBill={openCreateInvoiceModal}
        />

        {scanLoading ? (
          <div className="mb-4 flex h-[46px] items-center gap-3 rounded-[18px] border border-[#DBEAFE] bg-[#EFF6FF] px-4 text-[14px] font-semibold text-[#1D4ED8]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching item from backend...
          </div>
        ) : null}

        {scanError ? (
          <div className="mb-4 flex min-h-[46px] items-center justify-between gap-3 rounded-[18px] border border-red-200 bg-red-50 px-4 text-[14px] font-semibold text-red-700">
            <span>{scanError}</span>
            <button type="button" onClick={() => setScanError("")}>
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {billSuccess ? (
          <div className="mb-4 flex min-h-[46px] items-center gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 text-[14px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            {billSuccess}
          </div>
        ) : null}

        {lastScannedItem ? (
          <ScanSummaryCard
            item={lastScannedItem}
            onClose={() => setLastScannedItem(null)}
          />
        ) : null}

        <BillingCustomerFields
          customerName={customerName}
          customerPhone={customerPhone}
          setCustomerName={setCustomerName}
          setCustomerPhone={setCustomerPhone}
        />

        <div className="grid grid-cols-1 gap-[28px] xl:grid-cols-[minmax(0,1fr)_376px]">
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

          <BillSummaryCard
            items={items}
            metalValue={metalValue}
            makingCharges={makingCharges}
            gst={gst}
            grandTotal={grandTotal}
            totalItems={totalItems}
            totalWeight={totalWeight}
            onCreateBill={openCreateInvoiceModal}
            onClearAll={endBillingSession}
          />
        </div>
      </div>

      <CreateInvoiceModal
        open={invoiceModalOpen}
        loading={createBillLoading}
        error={createBillError}
        onClose={() => {
          if (!createBillLoading) {
            setInvoiceModalOpen(false);
            setCreateBillError("");
          }
        }}
        onSubmit={submitCreateInvoice}
      />
    </div>
  );
}

function ScanSummaryCard({
  item,
  onClose,
}: {
  item: LiveScannedBillingItem;
  onClose: () => void;
}) {
  const name = item.item_name || item.description || item.name || "Scanned Item";

  const code =
    item.product_code || item.article_code || item.sku_code || item.code || "-";

  return (
    <div className="relative mb-5 rounded-[24px] border border-[#BBF7D0] bg-white px-4 py-4 shadow-[0px_8px_24px_rgba(15,23,42,0.05)] sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] bg-[#F5F3FF] text-[#8B5CF6]">
            <ScanLine className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Item Scanned Successfully
            </div>

            <h3 className="truncate text-[20px] font-semibold tracking-[-0.03em] text-[#111827]">
              {name}
            </h3>

            <p className="mt-1 break-all text-[13px] font-medium text-[#667085]">
              {code}
            </p>
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

        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6] text-[#667085] hover:bg-[#E5E7EB]"
        >
          <X className="h-4 w-4" />
        </button>
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