"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ImageIcon,
  Package2,
  Play,
  Truck,
  UserRound,
  X,
} from "lucide-react";

import {
  DateInfo,
  LocationRow,
  RoutePill,
  StatCard,
  StatusPill,
  cn,
} from "./TransitShared";

import LiveTransitMap from "./LiveTransitMap";
import TransitMapModal from "./TransitMapModal";

import { getTransitById, markTransferReceived } from "./api";
import {
  canMarkDelivered,
  formatDate,
  getRouteLabel,
  getStatusLabel,
  isDeliveredStatus,
} from "./utils";

type ApiProduct = {
  id?: string | number;
  item_id?: string | number;
  qty?: number;
  quantity?: number;
  weight?: number;
  remarks?: string | null;
  item_name?: string;
  article_code?: string;
  category?: string;
  category_name?: string;
  sku?: string;
  purity?: string;
  rate?: number;
  gross_weight?: number;
  net_weight?: number;
};

type MediaPreview = {
  type: "image" | "video";
  src: string;
  title: string;
};

export default function TransitDetailContent({
  transferId,
}: {
  transferId?: string;
  basePath?: string;
}) {
  const params = useParams<{ transferId?: string }>();
  const resolvedTransferId = transferId || params?.transferId || "";

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any | null>(null);
  const [error, setError] = useState("");
  const [openPartner, setOpenPartner] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<MediaPreview | null>(null);
  const [marking, setMarking] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const loadData = useCallback(async () => {
    if (!resolvedTransferId) {
      setError("Transfer id is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getTransitById(resolvedTransferId);
      setItem(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transfer");
    } finally {
      setLoading(false);
    }
  }, [resolvedTransferId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const delivered = useMemo(() => isDeliveredStatus(item?.status), [item]);

  const handleMarkDelivered = async () => {
    if (!item || !canMarkDelivered(item.status)) return;

    try {
      setMarking(true);
      setError("");

      await markTransferReceived(item.id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update transfer");
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-w-0 font-erp">
        <div className="h-[72px] animate-pulse rounded-erp-lg bg-white" />

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[108px] animate-pulse rounded-erp-xl border border-erp-border bg-white"
            />
          ))}
        </div>

        <div className="mt-7 h-[260px] animate-pulse rounded-erp-2xl border border-erp-border bg-white" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="rounded-erp-lg border border-red-200 bg-red-50 p-6 text-[15px] font-medium text-red-700">
        {error || "Tracking not found."}
      </div>
    );
  }

  const trackingValue =
    item.tracking_number || item.transfer_no || `TRK-${item.id}`;

  const driverName = item.driver_details?.driver_name || "—";
  const driverPhone = item.driver_details?.driver_phone || "—";
  const vehicleNumber = item.driver_details?.vehicle_number || "—";

  const products: ApiProduct[] = Array.isArray(item.products)
    ? item.products
    : Array.isArray(item.transfer_items)
    ? item.transfer_items
    : [];

  const dispatchImages = toMediaArray(item.media?.dispatch_image_url);
  const receiveImages = toMediaArray(item.media?.receive_image_url);
  const videoUrl = item.media?.dispatch_video_url || "";
  const eWayBillUrl = item.media?.e_way_bill_url || item.e_way_bill_url || "";

  return (
    <>
      <div className="w-full min-w-0 font-erp">
        <div>
          <h1 className="erp-page-title">In Transit / Tracking</h1>
          <p className="mt-1 erp-page-subtitle">
            Monitor stock shipments across all locations
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <StatCard
            icon={<Truck className="h-6 w-6" />}
            title="In Transit"
            value={String(item.status).toLowerCase() === "in_transit" ? 1 : 0}
            iconWrapClass="bg-erp-purple-soft"
            iconClass="text-erp-purple"
          />

          <StatCard
            icon={<CheckCircle2 className="h-6 w-6" />}
            title="Shipments"
            value={1}
            iconWrapClass="bg-erp-success-soft"
            iconClass="text-erp-success"
          />

          <StatCard
            icon={<Package2 className="h-6 w-6" />}
            title="Goods Receipt"
            value={delivered ? 1 : 0}
            iconWrapClass="bg-erp-blue-soft"
            iconClass="text-erp-primary"
          />
        </div>

        <div className="mt-7 rounded-erp-2xl border border-erp-border bg-white px-6 py-6 shadow-erp-card">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="break-all text-[20px] font-semibold leading-[30px] tracking-[-0.03em] text-erp-heading md:text-[22px]">
                  Tracking: {trackingValue}
                </h2>

                <StatusPill delivered={delivered}>
                  {getStatusLabel(item.status)}
                </StatusPill>

                <RoutePill>{getRouteLabel(item)}</RoutePill>
              </div>

              <div className="mt-5">
                <LocationRow
                  from={item.from_organization_name || "—"}
                  to={item.to_organization_name || "—"}
                />
              </div>

              <div className="mt-5">
                <DateInfo
                  shippedDate={formatDate(
                    item.dispatch_date || item.transfer_date
                  )}
                  expectedDelivery={formatDate(item.expected_delivery_date)}
                />
              </div>

              <button
                type="button"
                onClick={() => setOpenPartner((prev) => !prev)}
                className="mt-8 inline-flex items-center gap-3"
              >
                <UserRound className="h-5 w-5 text-erp-success" />
                <span className="text-[18px] font-semibold tracking-[-0.02em] text-erp-heading">
                  Delivery Partner Details
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-erp-heading transition",
                    openPartner && "rotate-180"
                  )}
                />
              </button>

              {openPartner ? (
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[72px_repeat(4,minmax(0,1fr))]">
                  <button
                    type="button"
                    onClick={() => {
                      if (!item.driver_details?.driver_photo_url) return;
                      setMediaPreview({
                        type: "image",
                        src: item.driver_details.driver_photo_url,
                        title: "Driver Photo",
                      });
                    }}
                    className="flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-erp-xs bg-[#D9D9D9]"
                  >
                    {item.driver_details?.driver_photo_url ? (
                      <img
                        src={item.driver_details.driver_photo_url}
                        alt={driverName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-1 text-center text-[10px] font-medium text-erp-muted">
                        Not found
                      </span>
                    )}
                  </button>

                  <PartnerInfo label="Driver Name *" value={driverName} />
                  <PartnerInfo label="Driver Phone *" value={driverPhone} />
                  <PartnerInfo label="Vehicle Number *" value={vehicleNumber} />
                  <PartnerInfo label="Tracking Number" value={trackingValue} />
                </div>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex justify-start xl:justify-end">
                <button
                  type="button"
                  onClick={handleMarkDelivered}
                  disabled={
                    !canMarkDelivered(item.status) || marking || delivered
                  }
                  className="inline-flex h-[44px] items-center justify-center gap-2 rounded-erp-sm bg-erp-success px-5 text-[15px] font-semibold text-white shadow-erp-card transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <CheckCircle2 className="h-[18px] w-[18px]" />
                  {marking
                    ? "Updating..."
                    : delivered
                    ? "Delivered"
                    : "Mark Delivered"}
                </button>
              </div>

              <div
                onClick={() => setMapOpen(true)}
                className="h-[250px] cursor-pointer overflow-hidden rounded-[24px] shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
              >
                <LiveTransitMap transferId={item.id} preview height={250} />
              </div>
            </div>
          </div>

          <div className="mt-8 h-px bg-erp-border" />

          <div className="mt-5">
            <h3 className="text-[15px] font-semibold text-erp-text-soft">
              Products in Transit:
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
              <div className="space-y-4">
                {products.length ? (
                  products.map((product, index) => {
                    const key = String(product.id || product.item_id || index);

                    return (
                      <ProductAccordionCard
                        key={key}
                        product={product}
                        open={!!expandedItems[key]}
                        onToggle={() =>
                          setExpandedItems((prev) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                      />
                    );
                  })
                ) : (
                  <EmptyBox text="No product items available." />
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                <MediaSlot
                  title="Dispatch Image"
                  src={dispatchImages[0]}
                  type="image"
                  onOpen={setMediaPreview}
                />

                <MediaSlot
                  title="E-Way Bill"
                  src={eWayBillUrl}
                  type="image"
                  onOpen={setMediaPreview}
                />

                <MediaSlot
                  title="Dispatch Video"
                  src={videoUrl}
                  type="video"
                  onOpen={setMediaPreview}
                />

                {dispatchImages.slice(1).map((src, index) => (
                  <MediaSlot
                    key={`dispatch-${src}-${index}`}
                    title={`Dispatch Image ${index + 2}`}
                    src={src}
                    type="image"
                    onOpen={setMediaPreview}
                  />
                ))}

                {receiveImages.map((src, index) => (
                  <MediaSlot
                    key={`receive-${src}-${index}`}
                    title={`Receive Image ${index + 1}`}
                    src={src}
                    type="image"
                    onOpen={setMediaPreview}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TransitMapModal
        open={mapOpen}
        transferId={item.id}
        onClose={() => setMapOpen(false)}
      />

      <MediaPreviewModal
        media={mediaPreview}
        onClose={() => setMediaPreview(null)}
      />
    </>
  );
}

function PartnerInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[13px] font-medium leading-5 text-erp-heading">
        {label}
      </div>
      <div className="mt-1 truncate text-[13px] leading-5 text-erp-muted">
        {value}
      </div>
    </div>
  );
}

function ProductAccordionCard({
  product,
  open,
  onToggle,
}: {
  product: ApiProduct;
  open: boolean;
  onToggle: () => void;
}) {
  const qty = product.quantity ?? product.qty ?? 0;

  return (
    <div className="overflow-hidden rounded-erp-md bg-erp-card-soft">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="truncate text-[15px] font-medium text-erp-heading">
            {product.item_name || "Unnamed Product"}
          </div>
          <div className="mt-1 text-[14px] text-erp-muted">Quantity: {qty}</div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-erp-heading transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-erp-border px-4 py-4">
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <InfoMini
              label="Category"
              value={product.category || product.category_name || "—"}
            />
            <InfoMini
              label="Article Code"
              value={product.article_code || product.sku || "—"}
            />
            <InfoMini label="Rate" value={String(product.rate || "—")} />
            <InfoMini label="Weight" value={String(product.weight || "—")} />
            <InfoMini
              label="Gross Weight"
              value={String(product.gross_weight || "—")}
            />
            <InfoMini
              label="Net Weight"
              value={String(product.net_weight || "—")}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[12px] font-medium text-erp-placeholder">
        {label}
      </div>
      <div className="mt-1 truncate text-[13px] font-medium text-erp-text-soft">
        {value}
      </div>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="flex min-h-[156px] items-center justify-center rounded-erp-md border border-dashed border-erp-border bg-erp-card-soft px-4 text-center text-[14px] text-erp-muted">
      {text}
    </div>
  );
}

function MediaSlot({
  title,
  src,
  type,
  onOpen,
}: {
  title: string;
  src?: string | null;
  type: "image" | "video";
  onOpen: (media: MediaPreview) => void;
}) {
  if (!src) {
    return (
      <div className="flex h-[156px] min-w-0 flex-col items-center justify-center rounded-[20px] border border-dashed border-erp-border bg-erp-card-soft px-4 text-center shadow-erp-card">
        <ImageIcon className="h-7 w-7 text-erp-placeholder" />

        <p className="mt-3 max-w-[120px] truncate text-[15px] font-semibold leading-[20px] tracking-[-0.02em] text-erp-heading">
          {title}
        </p>

        <p className="mt-1 text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-erp-muted">
          Not found
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpen({ type, src, title })}
      className="group relative h-[156px] min-w-0 overflow-hidden rounded-[20px] bg-erp-card-soft text-left shadow-erp-card outline-none transition hover:-translate-y-[1px] focus:ring-2 focus:ring-erp-primary/20"
    >
      {type === "image" ? (
        <img src={src} alt={title} className="h-full w-full object-cover" />
      ) : (
        <video
          src={src}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      )}

      {type === "video" ? (
        <>
          <div className="absolute inset-0 bg-black/25" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-white shadow-md">
              <Play className="ml-[3px] h-[22px] w-[22px] fill-[#020316] text-[#020316]" />
            </div>
          </div>
        </>
      ) : null}
    </button>
  );
}

function MediaPreviewModal({
  media,
  onClose,
}: {
  media: MediaPreview | null;
  onClose: () => void;
}) {
  if (!media) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-[1050px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex h-[64px] items-center justify-between border-b border-erp-border px-5">
          <h3 className="truncate text-[18px] font-semibold text-erp-heading">
            {media.title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-erp-card-soft text-erp-heading transition hover:bg-erp-border"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex min-h-[420px] flex-1 items-center justify-center bg-[#0B1020] p-4">
          {media.type === "image" ? (
            <img
              src={media.src}
              alt={media.title}
              className="max-h-[78vh] max-w-full rounded-erp-md object-contain"
            />
          ) : (
            <video
              src={media.src}
              className="max-h-[78vh] max-w-full rounded-erp-md"
              controls
              autoPlay
            />
          )}
        </div>
      </div>
    </div>
  );
}

function toMediaArray(value?: string | string[] | null): string[] {
  if (!value) return [];

  if (Array.isArray(value)) return value.filter(Boolean);

  const text = String(value).trim();

  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  return [text];
}