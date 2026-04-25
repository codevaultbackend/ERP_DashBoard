export type StockSummary = {
  total_stock_items: number;
  dead_stock_items: number;
  low_stock_items: number;
  transit_goods: number;
};

export type StockListApiItem = {
  category: string;
  code: string;
  quantity: number;
  selling_price: number;
  making_charge: number;
  purity: string;
  net_weight: number;
  stone_weight: number;
  gross_weight: number;
  action?: string;
};

export type StockListApiResponse = {
  success: boolean;
  message: string;
  summary?: StockSummary;
  count?: number;
  data: StockListApiItem[];
};

export type StockCategoryApiItem = {
  id?: string | number;
  article?: string;
  image?: string;
  code: string;
  quantity: number;
  purity: string;
  net_weight: number;
  stone_weight: number;
  gross_weight: number;
  selling_price?: number;
  making_charge?: number;
  category?: string;
};

export type StockCategoryApiResponse = {
  success: boolean;
  message: string;
  count?: number;
  data: StockCategoryApiItem[];
};

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

export type StockStats = {
  totalStockItems: number;
  deadStockItems: number;
  lowStockItems: number;
  transitGoods: number;
};