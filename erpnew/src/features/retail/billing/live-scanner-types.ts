export type LiveScannedBillingItem = {
  item_id?: number | string | null;
  id?: number | string | null;

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
  available_qty?: number;

  net_weight?: number;
  gross_weight?: number;
  stone_weight?: number;
  weight?: number;
  available_weight?: number;

  rate?: number;
  sale_rate?: number;
  purchase_rate?: number;

  metal_value?: number;
  making_charge_percent?: number;
  making_charge_value?: number;
  total_amount?: number;

  hsn_code?: string | null;
  current_status?: string | null;
  qr_type?: string | null;
  qr_code_url?: string | null;

  reserved_qty?: number;
  reserved_weight?: number;
  transit_qty?: number;
  transit_weight?: number;
  damaged_qty?: number;
  damaged_weight?: number;

  store_code?: string | null;
  raw_qr_value?: string;
  scanned_at?: string;
};

export type LiveScannerPayload = {
  session_id: string;
  item: LiveScannedBillingItem;
};