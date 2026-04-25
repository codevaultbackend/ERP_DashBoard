"use client";

import type {
  CategoryItemApi,
  CategoryRowApi,
  StockRequestApi,
} from "../api/request-api";

export type RequestCategoryOption = {
  label: string;
  value: string;
  quantity: number;
};

export type RequestableProduct = {
  id: number;
  item_id: number;
  name: string;
  stock: number;
  available_weight: number;
  tone: "critical" | "medium" | "optimum";
  qty: string;
  category: string;
  article_code: string;
  sku_code: string;
  purity: string;
  unit: string;
};

export type RequestCardItem = {
  id: number;
  request_no: string;
  priority: string;
  status:
    | "pending"
    | "approved"
    | "dispatch"
    | "partially_approved"
    | "rejected"
    | "completed";
  created: string;
  notes?: string;
  products: Array<{
    item_id: number;
    name: string;
    qty: number;
    approved_qty?: number;
  }>;
  raw: StockRequestApi;
};

export type RequestStat = {
  id: string;
  title: string;
  value: number;
  icon: "approved" | "arrow" | "truck" | "box";
  tone: "gold" | "green" | "red" | "purple";
  change?: string;
  changeTone?: "red" | "green";
};

export function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function mapCategoryRowToOption(row: CategoryRowApi): RequestCategoryOption {
  return {
    label: row.category || "Other",
    value: row.category || "Other",
    quantity: Number(row.quantity || 0),
  };
}

export function mapCategoryItemToRequestProduct(item: CategoryItemApi): RequestableProduct {
  const qty = Number(item.available_qty || item.quantity || 0);

  let tone: "critical" | "medium" | "optimum" = "medium";
  if (qty <= 2) tone = "critical";
  else if (qty <= 12) tone = "medium";
  else tone = "optimum";

  return {
    id: Number(item.id),
    item_id: Number(item.id),
    name: item.item_name || "",
    stock: qty,
    available_weight: Number(item.available_weight || 0),
    tone,
    qty: "",
    category: item.category || "",
    article_code: item.article_code || "",
    sku_code: item.sku_code || "",
    purity: item.purity || "",
    unit: item.unit || "",
  };
}

export function mapRequestToCard(item: StockRequestApi): RequestCardItem {
  const derivedStatus =
    item.status === "approved" ||
    item.status === "pending" ||
    item.status === "partially_approved" ||
    item.status === "rejected" ||
    item.status === "completed"
      ? item.status
      : item.transfer?.status === "in_transit"
      ? "dispatch"
      : "pending";

  return {
    id: item.id,
    request_no: item.request_no,
    priority: item.priority || "medium",
    status: derivedStatus,
    created: formatDate(item.created_at),
    notes: item.notes || item.remarks || "",
    products: (item.request_items || []).map((row) => ({
      item_id: Number(row.item_id),
      name: row.item?.item_name || `Item #${row.item_id}`,
      qty: Number(row.request_qty || 0),
      approved_qty: Number(row.approved_qty || 0),
    })),
    raw: item,
  };
}

export function buildStats(myRequests: StockRequestApi[]) {
  const approved = myRequests.filter(
    (r) => r.status === "approved" || r.status === "completed"
  ).length;

  const pending = myRequests.filter((r) => r.status === "pending").length;

  const rejected = myRequests.filter((r) => r.status === "rejected").length;

  const inTransit = myRequests.filter(
    (r) => r.transfer?.status === "in_transit"
  ).length;

  const stats: RequestStat[] = [
    {
      id: "approved",
      title: "Approved Requests",
      value: approved,
      icon: "approved",
      tone: "green",
    },
    {
      id: "pending",
      title: "Pending Requests",
      value: pending,
      icon: "arrow",
      tone: "gold",
    },
    {
      id: "transit",
      title: "In Transit",
      value: inTransit,
      icon: "truck",
      tone: "purple",
    },
    {
      id: "rejected",
      title: "Rejected Requests",
      value: rejected,
      icon: "box",
      tone: "red",
    },
  ];

  return stats;
}