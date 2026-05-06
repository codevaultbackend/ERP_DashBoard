export type LiveScannedBillingItem = {
  item_id?: number | null;
  id?: number | null;

  product_code?: string | null;
  article_code?: string | null;
  sku_code?: string | null;
  barcode?: string | null;
  code?: string | null;

  description?: string | null;
  details?: string | null;
  item_name?: string | null;
  name?: string | null;

  metal_type?: string | null;
  category?: string | null;
  purity?: string | null;
  unit?: string | null;

  qty?: number;
  max_qty?: number;

  net_weight?: number;
  gross_weight?: number;
  weight?: number;
  available_weight?: number;

  rate?: number;
  making_charge_percent?: number;

  store_code?: string | null;
  raw_qr_value?: string;
  scanned_at?: string;
};

export type LiveScannerPayload = {
  session_id: string;
  item: LiveScannedBillingItem;
};