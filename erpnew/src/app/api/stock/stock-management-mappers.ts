export type StockArticle = {
  id: string;
  image: string;
  article: string;
  code: string;
  quantity: number;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
};

export type StockRow = {
  id: number;
  category: string;
  code: string;
  quantity: number;
  sellingPrice: string;
  makingCharge: string;
  purity: string;
  netWeight: string;
  stoneWeight: string;
  grossWeight: string;
  image: string;
  articles?: StockArticle[];
};

type StockCategoryRowApi = {
  category: string;
  code?: string;
  quantity: number;
  selling_price?: number;
  making_charge?: number;
  purity?: string;
  net_weight?: number;
  stone_weight?: number;
  gross_weight?: number;
};

type StockCategoryItemApi = {
  id: number;
  article_code: string;
  sku_code: string;
  item_name: string;
  purity: string;
  gross_weight: number;
  net_weight: number;
  stone_weight: number;
  quantity: number;
  available_qty: number;
};

function safeText(value: unknown, fallback = "--") {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

function safeWeight(value: unknown) {
  if (value === null || value === undefined || value === "") return "--";
  return `${value} g`;
}

function safePrice(value: unknown) {
  if (value === null || value === undefined || value === "") return "--";
  return `₹${value}`;
}

export function mapCategoryRowsToStockRows(rows: StockCategoryRowApi[]): StockRow[] {
  return rows.map((row, index) => ({
    id: index + 1,
    category: safeText(row.category),
    code: safeText(row.code),
    quantity: Number(row.quantity || 0),
    sellingPrice: safePrice(row.selling_price),
    makingCharge: safePrice(row.making_charge),
    purity: safeText(row.purity),
    netWeight: safeWeight(row.net_weight),
    stoneWeight: safeWeight(row.stone_weight),
    grossWeight: safeWeight(row.gross_weight),
    image: "/images/placeholder-product.png",
    articles: [],
  }));
}

export function mapCategoryItemsToArticles(
  rows: StockCategoryItemApi[]
): StockArticle[] {
  return rows.map((row) => ({
    id: String(row.id),
    image: "/images/placeholder-product.png",
    article: safeText(row.item_name),
    code: safeText(row.article_code || row.sku_code),
    quantity: Number(row.available_qty ?? row.quantity ?? 0),
    purity: safeText(row.purity),
    netWeight: safeWeight(row.net_weight),
    stoneWeight: safeWeight(row.stone_weight),
    grossWeight: safeWeight(row.gross_weight),
  }));
}