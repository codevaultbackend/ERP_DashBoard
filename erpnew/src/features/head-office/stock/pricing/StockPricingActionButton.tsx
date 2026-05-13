"use client";

import { Pencil } from "lucide-react";
import type { EditableStockPricingItem } from "./EditStockPricingModal";

type Props = {
  item: EditableStockPricingItem;
  onEdit: (item: EditableStockPricingItem) => void;
};

function isNumericId(value: unknown) {
  return /^\d+$/.test(String(value || "").trim());
}

function prepareEditablePricingItem(
  item: EditableStockPricingItem
): EditableStockPricingItem {
  const raw = item?.raw || {};

  const resolvedItemId =
    item.item_id ||
    item.itemId ||
    item.ItemId ||
    item.db_item_id ||
    item.stock_item_id ||
    raw.item_id ||
    raw.itemId ||
    raw.ItemId ||
    raw.Item?.id ||
    raw.item?.id ||
    raw.original?.item_id ||
    raw.original?.id ||
    raw.dataValues?.item_id ||
    raw.dataValues?.id ||
    (isNumericId(raw.id) ? raw.id : undefined) ||
    (isNumericId(item.id) ? item.id : undefined);

  return {
    ...item,
    item_id: resolvedItemId,
    raw: item.raw || item,
  };
}

export default function StockPricingActionButton({ item, onEdit }: Props) {
  return (
    <button
      type="button"
      onClick={() => onEdit(prepareEditablePricingItem(item))}
      className="inline-flex h-9 w-9 items-center justify-center rounded-erp-full text-erp-primary transition hover:bg-erp-primary-soft hover:text-erp-primary-hover"
      title="Edit stock pricing"
    >
      <Pencil className="h-4 w-4" />
    </button>
  );
}