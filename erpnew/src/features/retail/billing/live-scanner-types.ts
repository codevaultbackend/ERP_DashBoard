export type LiveScannedBillingItem = {
  // ==========================
  // IDs
  // ==========================
  item_id?: number | string | null;
  id?: number | string | null;

  // ==========================
  // Codes
  // ==========================
  product_code?: string | null;
  article_code?: string | null;
  sku_code?: string | null;
  barcode?: string | null;
  code?: string | null;

  // ==========================
  // Product Details
  // ==========================
  item_name?: string | null;
  name?: string | null;
  description?: string | null;
  details?: string | null;

  category?: string | null;
  metal_type?: string | null;
  purity?: string | null;

  // ==========================
  // Quantity
  // ==========================
  qty?: number;
  max_qty?: number;
  available_qty?: number;

  // ==========================
  // Weights
  // ==========================
  gross_weight?: number;
  net_weight?: number;
  stone_weight?: number;
  stone_amount?: number;

  weight?: number;
  available_weight?: number;

  // ==========================
  // Pricing
  // ==========================
  rate?: number;
  sale_rate?: number;
  selling_price?: number;
  purchase_rate?: number;

  // ==========================
  // Charges
  // ==========================
  metal_value?: number;

  taxable_amount?: number;
  net_taxable_amount?: number;

  making_charge_percent?: number;
  making_charge_value?: number;

  old_making_charge?: number;
  making_charge_after_deduction?: number;
  making_charge_deduction?: number;

  other_discount?: number;

  gst_percent?: number;
  gst_amount?: number;

  total_amount?: number;

  // ==========================
  // Inventory
  // ==========================
  current_status?: string | null;

  reserved_qty?: number;
  reserved_weight?: number;

  transit_qty?: number;
  transit_weight?: number;

  damaged_qty?: number;
  damaged_weight?: number;

  // ==========================
  // Misc
  // ==========================
  hsn_code?: string | null;
  unit?: string | null;

  qr_type?: string | null;
  qr_code_url?: string | null;

  store_code?: string | null;

  raw_qr_value?: string;
  scanned_at?: string;
};

export type LiveScannerPayload = {
  session_id: string;
  item: LiveScannedBillingItem;
};