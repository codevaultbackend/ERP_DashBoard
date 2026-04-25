import { AuditIssue, AuditStatus, Category, Item, RetailStore } from "./types";

const STORAGE_KEY = "district-store-management-data";

const ringItems: Item[] = [
  {
    id: "ring-item-1",
    name: "Silver Ring 2.X",
    code: "5704-1234",
    quantity: 10,
    sellingPrice: "₹1.5L",
    makingCharge: "₹5,000",
    purity: "24K",
    netWt: "12g",
    stoneWt: "1g",
    grossWt: "13g",
    image:
      "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ring-item-2",
    name: "Gold Ring SSN",
    code: "5704-1235",
    quantity: 8,
    sellingPrice: "₹50,000",
    makingCharge: "₹4,000",
    purity: "22K",
    netWt: "10g",
    stoneWt: "0.5g",
    grossWt: "10.5g",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "ring-item-3",
    name: "Platinum Ring Prime",
    code: "5704-1236",
    quantity: 6,
    sellingPrice: "₹80,000",
    makingCharge: "₹6,500",
    purity: "24K",
    netWt: "16g",
    stoneWt: "2g",
    grossWt: "18g",
    image:
      "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=900&q=80",
  },
];

const necklaceItems: Item[] = [
  {
    id: "necklace-item-1",
    name: "Premium Necklace",
    code: "7804-1201",
    quantity: 5,
    sellingPrice: "₹2.2L",
    makingCharge: "₹12,000",
    purity: "24K",
    netWt: "24g",
    stoneWt: "2g",
    grossWt: "26g",
    image:
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "necklace-item-2",
    name: "Wedding Necklace",
    code: "7804-1202",
    quantity: 4,
    sellingPrice: "₹2.8L",
    makingCharge: "₹15,000",
    purity: "24K",
    netWt: "28g",
    stoneWt: "3g",
    grossWt: "31g",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=80",
  },
];

const bangleItems: Item[] = [
  {
    id: "bangle-item-1",
    name: "Royal Bangle",
    code: "8804-2201",
    quantity: 7,
    sellingPrice: "₹1.2L",
    makingCharge: "₹8,000",
    purity: "24K",
    netWt: "20g",
    stoneWt: "1.2g",
    grossWt: "21.2g",
    image:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "bangle-item-2",
    name: "Classic Bangle",
    code: "8804-2202",
    quantity: 9,
    sellingPrice: "₹95,000",
    makingCharge: "₹6,500",
    purity: "22K",
    netWt: "18g",
    stoneWt: "1g",
    grossWt: "19g",
    image:
      "https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?auto=format&fit=crop&w=900&q=80",
  },
];

const chainItems: Item[] = [
  {
    id: "chain-item-1",
    name: "Men Gold Chain",
    code: "9904-3201",
    quantity: 12,
    sellingPrice: "₹1.1L",
    makingCharge: "₹7,000",
    purity: "22K",
    netWt: "19g",
    stoneWt: "0g",
    grossWt: "19g",
    image:
      "https://images.unsplash.com/photo-1617038261407-7d276bf96512?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "chain-item-2",
    name: "Designer Chain",
    code: "9904-3202",
    quantity: 6,
    sellingPrice: "₹1.6L",
    makingCharge: "₹9,000",
    purity: "24K",
    netWt: "25g",
    stoneWt: "0g",
    grossWt: "25g",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80",
  },
];

function createCategory(
  id: string,
  name: string,
  code: string,
  quantity: number,
  sellingPrice: string,
  makingCharge: string,
  purity: string,
  netWt: string,
  stoneWt: string,
  grossWt: string,
  items: Item[]
): Category {
  return {
    id,
    name,
    code,
    quantity,
    sellingPrice,
    makingCharge,
    purity,
    netWt,
    stoneWt,
    grossWt,
    auditStatus: "pending",
    items,
  };
}

export const DEFAULT_DISTRICT_STORES: RetailStore[] = [
  {
    id: "store-1",
    name: "Andheri Retail Store",
    code: "ARS-001",
    active: true,
    employeeCount: 8,
    revenue: "₹9.2Cr",
    categories: [
      createCategory(
        "cat-ring",
        "Ring",
        "CAT-RNG",
        24,
        "₹50,000",
        "₹5,000",
        "24K",
        "12g",
        "1g",
        "13g",
        ringItems
      ),
      createCategory(
        "cat-necklace",
        "Necklace",
        "CAT-NCK",
        9,
        "₹2.2L",
        "₹12,000",
        "24K",
        "24g",
        "2g",
        "26g",
        necklaceItems
      ),
      createCategory(
        "cat-bangle",
        "Bangle",
        "CAT-BGL",
        16,
        "₹1.2L",
        "₹8,000",
        "24K",
        "20g",
        "1.2g",
        "21.2g",
        bangleItems
      ),
    ],
  },
  {
    id: "store-2",
    name: "Borivali Retail Store",
    code: "BRS-002",
    active: true,
    employeeCount: 10,
    revenue: "₹8.7Cr",
    categories: [
      createCategory(
        "cat2-ring",
        "Ring",
        "CAT-RNG-2",
        20,
        "₹48,000",
        "₹4,500",
        "22K",
        "11g",
        "0.8g",
        "11.8g",
        ringItems.map((item, index) => ({
          ...item,
          id: `cat2-ring-item-${index + 1}`,
        }))
      ),
      createCategory(
        "cat2-chain",
        "Chain",
        "CAT-CHN-2",
        18,
        "₹1.1L",
        "₹7,000",
        "22K",
        "19g",
        "0g",
        "19g",
        chainItems.map((item, index) => ({
          ...item,
          id: `cat2-chain-item-${index + 1}`,
        }))
      ),
      createCategory(
        "cat2-bangle",
        "Bangle",
        "CAT-BGL-2",
        14,
        "₹98,000",
        "₹6,800",
        "22K",
        "18g",
        "1g",
        "19g",
        bangleItems.map((item, index) => ({
          ...item,
          id: `cat2-bangle-item-${index + 1}`,
        }))
      ),
    ],
  },
  {
    id: "store-3",
    name: "Malad Retail Store",
    code: "MRS-003",
    active: false,
    employeeCount: 7,
    revenue: "₹6.4Cr",
    categories: [
      createCategory(
        "cat3-ring",
        "Ring",
        "CAT-RNG-3",
        15,
        "₹47,000",
        "₹4,200",
        "22K",
        "10g",
        "0.5g",
        "10.5g",
        ringItems.map((item, index) => ({
          ...item,
          id: `cat3-ring-item-${index + 1}`,
        }))
      ),
      createCategory(
        "cat3-necklace",
        "Necklace",
        "CAT-NCK-3",
        8,
        "₹2.5L",
        "₹13,500",
        "24K",
        "26g",
        "2.4g",
        "28.4g",
        necklaceItems.map((item, index) => ({
          ...item,
          id: `cat3-necklace-item-${index + 1}`,
        }))
      ),
    ],
  },
];

export function getDistrictStoreManagementData(): RetailStore[] {
  if (typeof window === "undefined") return DEFAULT_DISTRICT_STORES;

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_DISTRICT_STORES)
    );
    return DEFAULT_DISTRICT_STORES;
  }

  try {
    return JSON.parse(raw) as RetailStore[];
  } catch {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(DEFAULT_DISTRICT_STORES)
    );
    return DEFAULT_DISTRICT_STORES;
  }
}

export function setDistrictStoreManagementData(data: RetailStore[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetDistrictStoreManagementData() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(DEFAULT_DISTRICT_STORES)
  );
}

export function getStoreById(stores: RetailStore[], storeId: string) {
  return stores.find((store) => store.id === storeId) ?? null;
}

export function getCategoryById(
  stores: RetailStore[],
  storeId: string,
  categoryId: string
) {
  const store = getStoreById(stores, storeId);
  if (!store) return null;

  return (
    store.categories.find((category) => category.id === categoryId) ?? null
  );
}

export function updateCategoryAuditStatus(
  stores: RetailStore[],
  storeId: string,
  categoryId: string,
  issue: AuditIssue
) {
  const nextStatus: AuditStatus = issue === "pass" ? "pass" : "issue";

  const updated = stores.map((store) => {
    if (store.id !== storeId) return store;

    return {
      ...store,
      categories: store.categories.map((category) =>
        category.id === categoryId
          ? { ...category, auditStatus: nextStatus }
          : category
      ),
    };
  });

  setDistrictStoreManagementData(updated);
  return updated;
}