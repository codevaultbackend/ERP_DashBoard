"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  Loader2,
  ScanLine,
  X,
} from "lucide-react";

import BillingHeader from "./BillingHeader";
import BillingSearchBar from "./BillingSearchBar";
import BillingCustomerFields from "./BillingCustomerFields";
import BillingItemsCard from "./BillingItemsCard";
import BillSummaryCard from "./BillSummaryCard";
import DesktopBillingScannerReceiver from "./DesktopBillingScannerReceiver";

import CreateInvoiceModal, {
  type InvoiceCustomerForm,
} from "./CreateInvoiceModal";

import type {
  LiveScannedBillingItem,
} from "../live-scanner-types";

import {
  createBillingInvoice,
  scanBillingItemByCode,
  type CreateBillItemPayload,
} from "../billing-api";

import {
  PRODUCT_DB,
  type Product,
} from "../../data/billing-data";

import {
  formatCurrency,
  formatWeight,
} from "../../utils/billing-utils";

const BILLING_SESSION_STORAGE_KEY =
  "erp_billing_active_session_v2";

function toNumber(
  value: unknown,
  fallback = 0
) {
  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : fallback;
}

function sanitizeText(value?: string) {
  const clean = String(
    value || ""
  ).trim();

  return clean || null;
}

function getScannedCode(
  item: LiveScannedBillingItem
) {
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

export type BillingCartItem = {
  id: number;

  item_id?: number | string | null;

  code: string;

  name: string;

  metalValue: number;

  makingCharges: number;
  editableMakingCharges?: number;

  onMakingChargesChange?: (
    value: number
  ) => void;

  gstAmount: number;

  totalAmount: number;

  weight: number;

  qty: number;

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

  lastScannedItem:
  | LiveScannedBillingItem
  | null;

  updatedAt: string;
};

function mapProductToCartItem(
  product: Product
): BillingCartItem {
  return {
    id: product.id,

    code: product.code,

    name: product.name,

    metalValue: product.metalValue,

    makingCharges:
      product.makingCharges,

    weight: product.weight,

    qty: 1,

    net_weight:
      product.weight,
  };
}

function mapScannedItemToCartItem(
  item: LiveScannedBillingItem
): BillingCartItem {
  const code = getScannedCode(item);

  return {
    id: Number(item.item_id ?? item.id ?? Date.now()),

    item_id: item.item_id ?? item.id ?? null,

    code: code || `QR-${Date.now()}`,

    name:
      item.item_name ||
      item.description ||
      item.details ||
      item.name ||
      "Scanned Item",

    metalValue: Number(item.taxable_amount ?? 0),

    makingCharges: Number(item.making_charge_value ?? 0),

    gstAmount: Number(item.gst_amount ?? 0),

    totalAmount: Number(item.total_amount ?? 0),

    weight: Number(item.net_weight ?? item.weight ?? 0),

    qty: Number(item.qty ?? 1),

    raw_qr_value: item.raw_qr_value,

    scanned_raw: item,

    available_qty: Number(item.available_qty ?? 1),

    purity: item.purity ?? null,

    metal_type: item.metal_type ?? null,

    gross_weight: Number(item.gross_weight ?? 0),

    net_weight: Number(item.net_weight ?? 0),

    stone_weight: Number(item.stone_weight ?? 0),

    rate: Number(item.rate ?? 0),

    making_charge_percent: Number(
      item.making_charge_percent ??
      item.old_making_charge ??
      0
    ),

    hsn_code: item.hsn_code ?? null,

    unit: item.unit ?? "gram",
  };
}

function readStoredBillingSession() {

  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  try {

    const raw =
      localStorage.getItem(
        BILLING_SESSION_STORAGE_KEY
      );

    if (!raw) {
      return null;
    }

    const parsed =
      JSON.parse(
        raw
      ) as StoredBillingSession;

    if (
      !parsed ||
      !Array.isArray(
        parsed.items
      )
    ) {
      return null;
    }

    return parsed;

  } catch {

    return null;
  }
}

function writeStoredBillingSession(
  data: StoredBillingSession
) {

  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  localStorage.setItem(
    BILLING_SESSION_STORAGE_KEY,
    JSON.stringify(data)
  );
}

function clearStoredBillingSession() {

  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  localStorage.removeItem(
    BILLING_SESSION_STORAGE_KEY
  );
}

export default function BillingPageContent() {

  const hydratedRef =
    useRef(false);

  const scannedEventIdsRef =
    useRef(new Set<string>());

  const scannedCodesRef =
    useRef(new Set<string>());

  const [query, setQuery] =
    useState("");

  const [
    customerName,
    setCustomerName,
  ] = useState("");
  const [editableMakingCharges, setEditableMakingCharges] = useState(0);

  const [
    customerPhone,
    setCustomerPhone,
  ] = useState("");

  const [scannerItems, setScannerItems] =
    useState<BillingCartItem[]>([]);

  const [manualItems, setManualItems] =
    useState<BillingCartItem[]>([]);

  const [
    showSuggestions,
    setShowSuggestions,
  ] = useState(false);

  const [
    scanLoading,
    setScanLoading,
  ] = useState(false);

  const [scanError, setScanError] =
    useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);


  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [invoiceForm, setInvoiceForm] =
    useState<InvoiceCustomerForm>({
      name: "",
      phone: "",
      pan_card_number: "",
      pincode: "",
      address: "",
    });

  const [
    lastScannedItem,
    setLastScannedItem,
  ] =
    useState<LiveScannedBillingItem | null>(
      null
    );

  const [
    billSuccess,
    setBillSuccess,
  ] = useState("");

  useEffect(() => {

    const stored =
      readStoredBillingSession();

    if (stored) {

      setScannerItems(
        stored.items || []
      );

      setCustomerName(
        stored.customerName ||
        ""
      );

      setCustomerPhone(
        stored.customerPhone ||
        ""
      );

      setLastScannedItem(
        stored.lastScannedItem ||
        null
      );
    }

    hydratedRef.current = true;

  }, []);
  const handleCreateBill = () => {
    if (!scannerItems.length) {
      setScanError("No items added");
      return;
    }

    setShowInvoiceModal(true);
  };

  const handleInvoiceChange = (
    field: keyof InvoiceCustomerForm,
    value: string
  ) => {
    setInvoiceForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleInvoiceSubmit = async (
    customerForm: InvoiceCustomerForm
  ) => {
    try {
      setCreatingInvoice(true);

      const payload = {
        customer: {
          name: customerForm.name,
          phone: customerForm.phone,
          pan_card_number:
            customerForm.pan_card_number,
          pincode:
            customerForm.pincode,
          address:
            customerForm.address,
        },

        items: scannerItems.map(
          (
            item
          ): CreateBillItemPayload => ({
            item_id:
              item.item_id ||
              item.id,

            product_code:
              item.code,

            description:
              item.name,

            qty:
              Number(
                item.qty || 1
              ),

            net_weight:
              Number(
                item.net_weight ||
                item.weight ||
                0
              ),

            rate:
              Number(
                item.rate || 0
              ),

            making_charge_percent:
              Number(
                item.making_charge_percent ||
                0
              ),

            unit:
              item.unit ||
              "gram",
          })
        ),
      };

      console.log(
        "CREATE BILL PAYLOAD",
        payload
      );

      const response =
        await createBillingInvoice(
          payload
        );

      console.log(
        "CREATE BILL RESPONSE",
        response
      );

      setBillSuccess(
        response?.message ||
        "Invoice created successfully"
      );

      setShowInvoiceModal(false);

      endBillingSession();

    } catch (error: any) {

      setScanError(
        error?.message ||
        "Failed to create invoice"
      );

    } finally {

      setCreatingInvoice(false);
    }
  };

  useEffect(() => {

    if (
      !hydratedRef.current
    ) {
      return;
    }

    if (
      scannerItems.length === 0 &&
      !customerName &&
      !customerPhone &&
      !lastScannedItem
    ) {

      clearStoredBillingSession();

      return;
    }

    writeStoredBillingSession({
      items: scannerItems,

      customerName,

      customerPhone,

      lastScannedItem,

      updatedAt:
        new Date().toISOString(),
    });

  }, [
    scannerItems,
    customerName,
    customerPhone,
    lastScannedItem,
  ]);

  const suggestions =
    useMemo(() => {

      const q =
        query
          .trim()
          .toLowerCase();

      if (!q) {
        return [];
      }

      return PRODUCT_DB.filter(
        (item) =>
          item.code
            .toLowerCase()
            .includes(q) ||
          item.name
            .toLowerCase()
            .includes(q)
      ).slice(0, 6);

    }, [query]);

  const totalItems =
    useMemo(() => {

      return scannerItems.reduce(
        (
          acc,
          item
        ) =>
          acc + item.qty,
        0
      );

    }, [scannerItems]);

  const totalWeight =
    useMemo(() => {

      return scannerItems.reduce(
        (
          acc,
          item
        ) =>
          acc +
          item.weight *
          item.qty,
        0
      );

    }, [scannerItems]);

  const metalValue =
    useMemo(() => {

      return scannerItems.reduce(
        (
          acc,
          item
        ) =>
          acc +
          item.metalValue *
          item.qty,
        0
      );

    }, [scannerItems]);

  const makingCharges =
    useMemo(() => {

      return scannerItems.reduce(
        (
          acc,
          item
        ) =>
          acc +
          item.makingCharges *
          item.qty,
        0
      );

    }, [scannerItems]);

  const gst = useMemo(() => {
    return scannerItems.reduce(
      (sum, item) =>
        sum + (item.gstAmount || 0) * item.qty,
      0
    );
  }, [scannerItems]);

  const grandTotal = useMemo(() => {
    return scannerItems.reduce(
      (sum, item) =>
        sum + (item.totalAmount || 0) * item.qty,
      0
    );
  }, [scannerItems]);

  function addProduct(
    product: Product
  ) {

    const cartItem =
      mapProductToCartItem(
        product
      );

    setScannerItems((prev) => {

      const existing =
        prev.find(
          (x) =>
            x.code ===
            cartItem.code
        );

      if (existing) {

        return prev.map(
          (x) => {

            if (
              x.code !==
              cartItem.code
            ) {
              return x;
            }

            return {
              ...x,
              qty:
                x.qty + 1,
            };
          }
        );
      }

      return [
        ...prev,
        cartItem,
      ];
    });

    setQuery("");

    setShowSuggestions(
      false
    );
  }

  const addScannedItemToCart =
    useCallback(
      (
        scannedItem: LiveScannedBillingItem
      ) => {

        const code =
          getScannedCode(
            scannedItem
          );

        if (
          scannedCodesRef.current.has(
            code
          )
        ) {
          return;
        }

        scannedCodesRef.current.add(
          code
        );

        const cartItem =
          mapScannedItemToCartItem(
            scannedItem
          );

        setScannerItems((prev) => {

          const existing =
            prev.find(
              (
                item
              ) =>
                item.code.toLowerCase() ===
                cartItem.code.toLowerCase() ||
                (!!cartItem.item_id &&
                  String(
                    item.item_id
                  ) ===
                  String(
                    cartItem.item_id
                  ))
            );

          if (
            existing
          ) {
            return prev;
          }

          return [
            ...prev,
            cartItem,
          ];
        });

        setLastScannedItem(
          scannedItem
        );

        setScanError("");

        setBillSuccess("");

        setQuery("");

        setShowSuggestions(
          false
        );
      },
      []
    );

  const handleLiveScannedItem =
    useCallback(
      (
        scannedItem: LiveScannedBillingItem
      ) => {

        const unique =
          String(
            scannedItem.raw_qr_value ||
            scannedItem.item_id ||
            scannedItem.code ||
            ""
          );

        if (
          scannedEventIdsRef.current.has(
            unique
          )
        ) {
          return;
        }

        scannedEventIdsRef.current.add(
          unique
        );

        addScannedItemToCart(
          scannedItem
        );
      },
      [
        addScannedItemToCart,
      ]
    );

  async function scanCodeFromDesktop(
    code: string
  ) {

    if (
      scanLoading
    ) {
      return;
    }

    try {

      setScanLoading(
        true
      );

      setScanError("");

      setBillSuccess("");

      const item =
        await scanBillingItemByCode(
          code
        );

      addScannedItemToCart(
        item
      );

    } catch (error: any) {

      setScanError(
        error?.message ||
        "Failed to scan item"
      );

    } finally {

      setScanLoading(
        false
      );
    }
  }

  async function handleSearchSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    const clean =
      query.trim();

    if (
      !clean
    ) {
      return;
    }

    await scanCodeFromDesktop(
      clean
    );
  }

  function removeProduct(
    code: string
  ) {

    setScannerItems((prev) =>
      prev.filter(
        (x) =>
          x.code !== code
      )
    );
  }

  function increaseQty(
    code: string
  ) {

    setScannerItems((prev) =>
      prev.map(
        (item) => {

          if (
            item.code !==
            code
          ) {
            return item;
          }

          const maxQty =
            toNumber(
              item.available_qty,
              999999
            );

          return {
            ...item,
            qty: Math.min(
              item.qty + 1,
              maxQty
            ),
          };
        }
      )
    );
  }

  function decreaseQty(
    code: string
  ) {

    setScannerItems((prev) =>
      prev
        .map(
          (item) => {

            if (
              item.code !==
              code
            ) {
              return item;
            }

            return {
              ...item,
              qty:
                item.qty - 1,
            };
          }
        )
        .filter(
          (x) => x.qty > 0
        )
    );
  }

  function endBillingSession() {
  scannedCodesRef.current.clear();
  scannedEventIdsRef.current.clear();

  setScannerItems([]);
  setManualItems([]);

  setCustomerName("");
  setCustomerPhone("");

  setLastScannedItem(null);

  setScanError("");
  setBillSuccess("");

  clearStoredBillingSession();
}

const handleManualBillCreated = () => {
  endBillingSession();
};
 const handleClearAll = () => {
  endBillingSession();
};

  return (
    <div className="min-h-screen overflow-x-hidden ">

      <DesktopBillingScannerReceiver
        onItemReceived={
          handleLiveScannedItem
        }
      />

      <div className="mx-auto w-full max-w-[1510px] ">

        <BillingHeader />

        <BillingSearchBar
          query={query}
          setQuery={setQuery}
          showSuggestions={
            showSuggestions
          }
          setShowSuggestions={
            setShowSuggestions
          }
          suggestions={
            suggestions
          }
          onSubmit={
            handleSearchSubmit
          }
          onSelectProduct={
            addProduct
          }
        />

        {scanLoading ? (
          <div className="mb-4 flex min-h-[46px] flex-wrap items-center gap-3 rounded-2xl border border-[#DBEAFE] bg-[#EFF6FF] px-3 py-3 text-[13px] font-semibold text-[#1D4ED8] sm:px-4 sm:text-[14px]">

            <Loader2 className="h-4 w-4 animate-spin" />

            Fetching item from backend...
          </div>
        ) : null}

        {scanError ? (
          <div className="mb-4 flex min-h-[46px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-[13px] font-semibold text-red-700 sm:px-4 sm:text-[14px]">

            <span>
              {scanError}
            </span>

            <button
              type="button"
              onClick={() =>
                setScanError("")
              }
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        {billSuccess ? (
          <div className="mb-4 flex min-h-[46px] flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-[13px] font-semibold text-emerald-700 sm:px-4 sm:text-[14px]">

            <CheckCircle2 className="h-4 w-4" />

            {billSuccess}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_376px]">

          <BillingItemsCard
            items={scannerItems}
            totalItems={
              totalItems
            }
            totalWeight={
              totalWeight
            }
            onTryScan={() => {

              const input =
                document.querySelector<HTMLInputElement>(
                  'input[placeholder*="Scan or enter"]'
                );

              input?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });

              input?.focus();
            }}
            onIncrease={
              increaseQty
            }
            onDecrease={
              decreaseQty
            }
            onRemove={
              removeProduct
            }
          />

          <BillSummaryCard
            items={scannerItems}
            metalValue={metalValue}

            makingCharges={makingCharges}

            editableMakingCharges={editableMakingCharges}

            onMakingChargesChange={setEditableMakingCharges}

            gst={gst}
            grandTotal={grandTotal}
            totalItems={totalItems}
            totalWeight={totalWeight}
            onCreateBill={handleCreateBill}
            onClearAll={handleClearAll}
          />
          <CreateInvoiceModal
            open={showInvoiceModal}
            loading={creatingInvoice}
            form={invoiceForm}
            onClose={() => setShowInvoiceModal(false)}
            onChange={handleInvoiceChange}
            onSubmit={handleInvoiceSubmit}
          />
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;

  value: string;
}) {

  return (
    <div className="min-w-0 rounded-2xl bg-[#F8FAFC] px-3 py-3 sm:px-4">

      <p className="text-[12px] font-medium text-[#667085]">
        {label}
      </p>

      <p className="mt-1 break-words text-[14px] font-bold text-[#111827] sm:text-[15px]">
        {value}
      </p>
    </div>
  );
}