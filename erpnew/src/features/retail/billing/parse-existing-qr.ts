import type { LiveScannedBillingItem } from "./live-scanner-types";

function toNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseExistingQrValue(rawValue: string): LiveScannedBillingItem {
  const raw = String(rawValue || "").trim();

  if (!raw) {
    throw new Error("Empty QR value");
  }

  try {
    const parsed = JSON.parse(raw);

    const code =
      parsed.product_code ||
      parsed.article_code ||
      parsed.sku_code ||
      parsed.barcode ||
      parsed.code ||
      "";

    return {
      item_id: parsed.item_id || parsed.id || null,
      id: parsed.item_id || parsed.id || null,

      product_code: code || null,
      article_code: parsed.article_code || code || null,
      sku_code: parsed.sku_code || code || null,
      barcode: parsed.barcode || code || null,
      code: code || null,

      description:
        parsed.description || parsed.details || parsed.item_name || parsed.name || null,
      details: parsed.details || parsed.description || null,
      item_name: parsed.item_name || parsed.name || null,
      name: parsed.name || parsed.item_name || parsed.description || null,

      metal_type: parsed.metal_type || null,
      category: parsed.category || null,
      purity: parsed.purity || null,
      unit: parsed.unit || "pcs",

      qty: toNumber(parsed.qty, 1),
      max_qty: toNumber(parsed.max_qty, 1),

      net_weight: toNumber(parsed.net_weight ?? parsed.weight, 0),
      gross_weight: toNumber(parsed.gross_weight, 0),
      weight: toNumber(parsed.net_weight ?? parsed.weight, 0),
      available_weight: toNumber(parsed.available_weight, 0),

      rate: toNumber(parsed.rate, 0),
      making_charge_percent: toNumber(parsed.making_charge_percent, 0),

      store_code: parsed.store_code || null,
      raw_qr_value: raw,
      scanned_at: new Date().toISOString(),
    };
  } catch {
    return {
      item_id: null,
      id: null,

      product_code: raw,
      article_code: raw,
      sku_code: raw,
      barcode: raw,
      code: raw,

      description: raw,
      item_name: raw,
      name: raw,

      unit: "pcs",
      qty: 1,
      max_qty: 1,

      net_weight: 0,
      gross_weight: 0,
      weight: 0,
      available_weight: 0,

      rate: 0,
      making_charge_percent: 0,

      raw_qr_value: raw,
      scanned_at: new Date().toISOString(),
    };
  }
}