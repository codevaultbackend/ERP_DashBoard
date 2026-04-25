import type {
  TransitLocationPoint,
  TransitTransfer,
  TransitTransferItem,
} from "./types";

export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getStatusLabel(status?: string) {
  const normalized = String(status || "").toLowerCase();

  switch (normalized) {
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "dispatched":
      return "Dispatched";
    case "in_transit":
      return "In Transit";
    case "received":
      return "Received";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status || "Unknown";
  }
}

export function isDeliveredStatus(status?: string) {
  const normalized = String(status || "").toLowerCase();
  return normalized === "received" || normalized === "delivered";
}

export function canMarkDelivered(status?: string) {
  const normalized = String(status || "").toLowerCase();
  return ["approved", "dispatched", "in_transit"].includes(normalized);
}

export function isInTransitStatus(status?: string) {
  const normalized = String(status || "").toLowerCase();
  return ["approved", "dispatched", "in_transit"].includes(normalized);
}

export function getRouteLabel(item: TransitTransfer) {
  const from =
    item.from_role ||
    item.from_organization_name ||
    "Source";

  const to =
    item.to_role ||
    item.to_organization_name ||
    "Destination";

  return `${from} → ${to}`;
}

export function normalizeTransitTransfer(item: any): TransitTransfer {
  const rawItems = Array.isArray(item?.products)
    ? item.products
    : Array.isArray(item?.transfer_items)
    ? item.transfer_items
    : Array.isArray(item?.items)
    ? item.items
    : [];

  const transferItems: TransitTransferItem[] = rawItems.map(
    (product: any, index: number) => ({
      id: product?.id ?? index + 1,
      item_name:
        product?.item_name ??
        product?.name ??
        product?.product_name ??
        "Item",
      category_name: product?.category_name ?? product?.category ?? undefined,
      quantity: Number(product?.quantity ?? product?.qty ?? 0),
      sku: product?.sku ?? product?.article_code,
      purity: product?.purity,
      weight: product?.weight ?? product?.gross_weight ?? undefined,
      image: product?.image ?? null,
      article_code: product?.article_code,
      remarks: product?.remarks ?? null,
      rate:
        product?.rate !== undefined && product?.rate !== null
          ? Number(product.rate)
          : undefined,
      gross_weight:
        product?.gross_weight !== undefined && product?.gross_weight !== null
          ? Number(product.gross_weight)
          : undefined,
      net_weight:
        product?.net_weight !== undefined && product?.net_weight !== null
          ? Number(product.net_weight)
          : undefined,
    })
  );

  const routePoints: TransitLocationPoint[] = Array.isArray(item?.route_points)
    ? item.route_points
        .map((point: any) => {
          const lat = toNumber(point?.lat);
          const lng = toNumber(point?.lng);

          if (lat === null || lng === null) return null;

          return {
            lat,
            lng,
            label: point?.label,
            timestamp: point?.timestamp,
          };
        })
        .filter(Boolean) as TransitLocationPoint[]
    : [];

  return {
    id: Number(item?.id ?? 0),
    transfer_no: item?.transfer_no ?? "—",
    tracking_number: item?.tracking_number ?? item?.transfer_no ?? undefined,
    request_id: item?.request_id,

    status: item?.status ?? "pending",
    remarks: item?.remarks ?? null,

    from_organization_id: item?.from_organization_id,
    from_organization_name: item?.from_organization_name ?? "—",
    to_organization_id: item?.to_organization_id,
    to_organization_name: item?.to_organization_name ?? "—",

    from_role: item?.from_role ?? undefined,
    to_role: item?.to_role ?? undefined,

    transfer_date: item?.transfer_date ?? item?.created_at,
    dispatch_date: item?.dispatch_date ?? undefined,
    receive_date: item?.receive_date ?? undefined,
    expected_delivery_date: item?.expected_delivery_date ?? undefined,
    expected_delivery_time: item?.expected_delivery_time ?? undefined,
    delivered_at: item?.delivered_at ?? undefined,

    created_at: item?.created_at ?? undefined,
    updated_at: item?.updated_at ?? undefined,

    driver_details: {
      driver_name:
        item?.driver_details?.driver_name ?? item?.driver_name ?? null,
      driver_phone:
        item?.driver_details?.driver_phone ?? item?.driver_phone ?? null,
      vehicle_number:
        item?.driver_details?.vehicle_number ?? item?.vehicle_number ?? null,
      tracking_number:
        item?.driver_details?.tracking_number ??
        item?.tracking_number ??
        item?.transfer_no ??
        null,
      driver_photo_url:
        item?.driver_details?.driver_photo_url ?? item?.driver_photo_url ?? null,
    },

    media: {
      dispatch_image_url:
        item?.media?.dispatch_image_url ?? item?.dispatch_image_url ?? null,
      dispatch_video_url:
        item?.media?.dispatch_video_url ?? item?.dispatch_video_url ?? null,
      receive_image_url:
        item?.media?.receive_image_url ?? item?.receive_image_url ?? null,
    },

    transfer_items: transferItems,

    source_lat: toNumber(item?.source_lat),
    source_lng: toNumber(item?.source_lng),
    destination_lat: toNumber(item?.destination_lat),
    destination_lng: toNumber(item?.destination_lng),
    current_lat: toNumber(item?.current_lat),
    current_lng: toNumber(item?.current_lng),

    route_points: routePoints,

    direction:
      item?.direction === "incoming" || item?.direction === "outgoing"
        ? item.direction
        : undefined,
  };
}

export function getMapPoints(item?: TransitTransfer | null) {
  if (!item) return [];

  const points: TransitLocationPoint[] = [];

  if (
    typeof item.source_lat === "number" &&
    typeof item.source_lng === "number"
  ) {
    points.push({
      lat: item.source_lat,
      lng: item.source_lng,
      label: item.from_organization_name || "Source",
    });
  }

  if (Array.isArray(item.route_points) && item.route_points.length > 0) {
    for (const point of item.route_points) {
      if (
        typeof point.lat === "number" &&
        typeof point.lng === "number"
      ) {
        points.push(point);
      }
    }
  }

  if (
    typeof item.current_lat === "number" &&
    typeof item.current_lng === "number"
  ) {
    points.push({
      lat: item.current_lat,
      lng: item.current_lng,
      label: "Current Location",
    });
  }

  if (
    typeof item.destination_lat === "number" &&
    typeof item.destination_lng === "number"
  ) {
    points.push({
      lat: item.destination_lat,
      lng: item.destination_lng,
      label: item.to_organization_name || "Destination",
    });
  }

  const unique = new Map<string, TransitLocationPoint>();

  for (const point of points) {
    unique.set(`${point.lat},${point.lng},${point.label || ""}`, point);
  }

  return Array.from(unique.values());
}

export function buildMergedSummary(items: TransitTransfer[]) {
  let in_transit = 0;
  let shipments = 0;
  let goods_receipt = 0;

  for (const item of items) {
    const status = String(item.status || "").toLowerCase();

    if (["approved", "dispatched", "in_transit"].includes(status)) {
      in_transit += 1;
    }

    if (["approved", "dispatched", "in_transit", "received", "delivered"].includes(status)) {
      shipments += 1;
    }

    if (["received", "delivered"].includes(status)) {
      goods_receipt += 1;
    }
  }

  return {
    in_transit,
    shipments,
    goods_receipt,
  };
}

export function sortTransfersByRecent(items: TransitTransfer[]) {
  return [...items].sort((a, b) => {
    const aTime = new Date(
      a.updated_at ||
        a.dispatch_date ||
        a.transfer_date ||
        a.created_at ||
        0
    ).getTime();

    const bTime = new Date(
      b.updated_at ||
        b.dispatch_date ||
        b.transfer_date ||
        b.created_at ||
        0
    ).getTime();

    return bTime - aTime;
  });
}