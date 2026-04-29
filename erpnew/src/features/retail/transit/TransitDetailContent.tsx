"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  Package2,
  Play,
  Truck,
  UserRound,
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
import type { TransitTransfer, TransitTransferItem } from "./types";
import {
  canMarkDelivered,
  formatDate,
  getRouteLabel,
  getStatusLabel,
  isDeliveredStatus,
} from "./utils";

export default function TransitDetailContent({
  transferId,
}: {
  transferId?: string;
  basePath?: string;
}) {
  const params = useParams<{ transferId?: string }>();
  const resolvedTransferId = transferId || params?.transferId || "";

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<TransitTransfer | null>(null);
  const [error, setError] = useState("");
  const [openPartner, setOpenPartner] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const [expandedItems, setExpandedItems] = useState<
    Record<string | number, boolean>
  >({});

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

  const dispatchImages = toMediaArray(item.media?.dispatch_image_url);
  const receiveImages = toMediaArray(item.media?.receive_image_url);
  const videoUrl = item.media?.dispatch_video_url || "";

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
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_378px]">
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

              {openPartner && (
                <>
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[72px_repeat(4,minmax(0,1fr))]">
                    <div className="flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-erp-xs bg-[#D9D9D9]">
                      {item.driver_details?.driver_photo_url ? (
                        <img
                          src={item.driver_details.driver_photo_url}
                          alt={driverName}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>

                    <PartnerInfo label="Driver Name *" value={driverName} />
                    <PartnerInfo label="Driver Phone *" value={driverPhone} />
                    <PartnerInfo
                      label="Vehicle Number *"
                      value={vehicleNumber}
                    />
                    <PartnerInfo label="Tracking Number" value={trackingValue} />
                  </div>

                  <div className="mt-8 h-px bg-erp-border" />

                  <div className="mt-5">
                    <h3 className="text-[15px] font-semibold text-erp-text-soft">
                      Products in Transit:
                    </h3>

                    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                      <div className="space-y-4">
                        {item.transfer_items?.length ? (
                          item.transfer_items.map((product) => (
                            <ProductAccordionCard
                              key={product.id}
                              product={product}
                              open={!!expandedItems[product.id]}
                              onToggle={() =>
                                setExpandedItems((prev) => ({
                                  ...prev,
                                  [product.id]: !prev[product.id],
                                }))
                              }
                            />
                          ))
                        ) : (
                          <EmptyBox text="No product items available." />
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {[...dispatchImages, ...receiveImages].map(
                          (src, index) => (
                            <MediaImage
                              key={`${src}-${index}`}
                              src={src}
                              alt="Transit media"
                            />
                          )
                        )}

                        {videoUrl ? <MediaVideo src={videoUrl} /> : null}

                        {!dispatchImages.length &&
                        !receiveImages.length &&
                        !videoUrl ? (
                          <EmptyBox text="No dispatch media available." />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex justify-start xl:justify-end">
                <button
                  type="button"
                  onClick={handleMarkDelivered}
                  disabled={!canMarkDelivered(item.status) || marking || delivered}
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
        </div>
      </div>

      <TransitMapModal
        open={mapOpen}
        transferId={item.id}
        onClose={() => setMapOpen(false)}
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
  product: TransitTransferItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-erp-md bg-erp-card-soft">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="truncate text-[15px] font-medium text-erp-heading">
            {product.item_name}
          </div>
          <div className="mt-1 text-[14px] text-erp-muted">
            Quantity: {product.quantity}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-erp-heading transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-erp-border px-4 py-4">
          <div className="grid grid-cols-2 gap-3 text-[13px]">
            <InfoMini label="Category" value={product.category_name || "—"} />
            <InfoMini label="SKU" value={product.sku || "—"} />
            <InfoMini label="Purity" value={product.purity || "—"} />
            <InfoMini label="Weight" value={String(product.weight || "—")} />
          </div>
        </div>
      )}
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

function MediaImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-erp-md bg-erp-card-soft shadow-erp-card">
      <img src={src} alt={alt} className="h-[156px] w-full object-cover" />
    </div>
  );
}

function MediaVideo({ src }: { src: string }) {
  return (
    <div className="relative overflow-hidden rounded-erp-md bg-erp-card-soft shadow-erp-card">
      <video src={src} className="h-[156px] w-full object-cover" controls />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md">
          <Play className="ml-0.5 h-5 w-5 text-erp-heading" />
        </div>
      </div>
    </div>
  );
}

function toMediaArray(value?: string | null): string[] {
  if (!value) return [];

  if (value.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  return [value];
}