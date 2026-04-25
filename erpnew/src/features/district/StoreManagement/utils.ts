import type {
  Category,
  DistrictStoreCategoryItemsResponse,
  DistrictStoreDetailResponse,
  DistrictStoreManagementListResponse,
  Item,
  RetailStore,
} from "./types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200&auto=format&fit=crop";

export function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isNaN(num) ? 0 : num;
}

export function formatCurrency(value: unknown) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(toNumber(value));
}

export function formatPlainNumber(value: unknown) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

export function formatWeight(value: unknown) {
  return `${formatPlainNumber(value)} g`;
}

export function mapStoresToUi(
  response: DistrictStoreManagementListResponse
): RetailStore[] {
  const stores = response?.data?.stores ?? [];

  return stores.map((store) => ({
    id: String(store.id),
    name: store.store_name || "Unnamed Store",
    code: store.store_code || "—",
    active: !!store.is_active,
    employeeCount: toNumber(store.employee_count),
    revenue: formatCurrency(store.revenue),
    stockValue: formatCurrency(store.stock_value),
    address: store.address || "",
    phoneNumber: store.phone_number,
    district: store.district,
    state: store.state,
  }));
}

export function mapCategoryItemsToUi(
  response: DistrictStoreCategoryItemsResponse
): Item[] {
  const items = response?.data?.items ?? [];

  return items.map((item) => ({
    id: String(item.item_id),
    name: item.item_name || "Unnamed Item",
    code: item.article_code || item.sku_code || "—",
    quantity: formatPlainNumber(item.stock?.available_qty ?? 0),
    sellingPrice: formatCurrency(item.sale_rate),
    makingCharge: formatCurrency(item.making_charge),
    purity: item.purity || "—",
    netWt: formatWeight(item.net_weight),
    stoneWt: formatWeight(item.stone_weight),
    grossWt: formatWeight(item.gross_weight),
    image: item.image_url || FALLBACK_IMAGE,
    auditStatus: "pending",
  }));
}

export function mapStoreDetailToCategories(
  response: DistrictStoreDetailResponse
): {
  storeName: string;
  categories: Category[];
} {
  const storeName = response?.data?.store?.store_name || "Store";
  const inventory = response?.data?.inventory ?? [];

  const grouped = new Map<string, Category>();

  for (const row of inventory) {
    const categoryName = row.category || "Uncategorized";
    const key = categoryName.toLowerCase();

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key,
        name: categoryName,
        code: row.code || "—",
        quantity: formatPlainNumber(0),
        sellingPrice: formatCurrency(0),
        makingCharge: formatCurrency(0),
        purity: row.purity || "—",
        netWt: formatWeight(0),
        stoneWt: formatWeight(0),
        grossWt: formatWeight(0),
        auditStatus: "pending",
        items: [],
      });
    }

    const category = grouped.get(key)!;

    category.items.push({
      id: String(row.item_id),
      name: row.item_name || "Unnamed Item",
      code: row.code || "—",
      quantity: formatPlainNumber(row.quantity),
      sellingPrice: formatCurrency(row.selling_price),
      makingCharge: formatCurrency(row.making_charge),
      purity: row.purity || "—",
      netWt: formatWeight(row.net_weight),
      stoneWt: formatWeight(row.stone_weight),
      grossWt: formatWeight(row.gross_weight),
      image: row.image_url || FALLBACK_IMAGE,
      auditStatus: "pending",
    });
  }

  const categories = Array.from(grouped.values()).map((category) => {
    const first = category.items[0];

    const quantity = category.items.reduce(
      (sum, item) => sum + toNumber(String(item.quantity).replace(/,/g, "")),
      0
    );

    const netWt = category.items.reduce(
      (sum, item) => sum + toNumber(String(item.netWt).replace(/[^\d.]/g, "")),
      0
    );

    const stoneWt = category.items.reduce(
      (sum, item) => sum + toNumber(String(item.stoneWt).replace(/[^\d.]/g, "")),
      0
    );

    const grossWt = category.items.reduce(
      (sum, item) => sum + toNumber(String(item.grossWt).replace(/[^\d.]/g, "")),
      0
    );

    return {
      ...category,
      code: first?.code || "—",
      quantity: formatPlainNumber(quantity),
      sellingPrice: first?.sellingPrice || formatCurrency(0),
      makingCharge: first?.makingCharge || formatCurrency(0),
      purity: first?.purity || "—",
      netWt: formatWeight(netWt),
      stoneWt: formatWeight(stoneWt),
      grossWt: formatWeight(grossWt),
      items: category.items,
    };
  });

  return { storeName, categories };
}