"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
import TransitGoogleMap from "./TransitGoogleMap";
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
}) {
  const params = useParams<{ transferId?: string }>();

  const resolvedTransferId = useMemo(() => {
    if (transferId && String(transferId).trim()) return String(transferId);
    if (params?.transferId && String(params.transferId).trim()) {
      return String(params.transferId);
    }
    return "";
  }, [transferId, params]);

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<TransitTransfer | null>(null);
  const [error, setError] = useState("");
  const [openPartner, setOpenPartner] = useState(true);
  const [mapOpen, setMapOpen] = useState(false);
  const [marking, setMarking] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string | number, boolean>>({});

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

  useEffect(() => {
    if (!mapOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMapOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mapOpen]);

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

  const toggleItem = (id: string | number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="w-full min-w-0">
        <div className="h-[72px] animate-pulse rounded-[20px] bg-white/80" />
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[108px] animate-pulse rounded-[26px] border border-[#E5E7EB] bg-white"
            />
          ))}
        </div>
        <div className="mt-7 h-[640px] animate-pulse rounded-[30px] border border-[#E5E7EB] bg-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-[#FDA29B] bg-[#FEF3F2] p-6 text-[15px] font-medium text-[#B42318]">
        {error}
      </div>
    );
  }

  if (!item) {
    return (
      <div className="rounded-[24px] border border-[#D9DEE7] bg-white p-8 text-[15px] font-medium text-[#111827]">
        Tracking not found.
      </div>
    );
  }

  const trackingValue = item.tracking_number || item.transfer_no || `TRK-${item.id}`;
  const driverName = item.driver_details?.driver_name || "—";
  const driverPhone = item.driver_details?.driver_phone || "—";
  const vehicleNumber = item.driver_details?.vehicle_number || "—";

  const mediaAvailable =
    !!item.media?.dispatch_image_url ||
    !!item.media?.receive_image_url ||
    !!item.media?.dispatch_video_url;

  return (
    <>
      <div className="w-full min-w-0">
        <div>
          <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.04em] text-[#111827] md:text-[32px]">
            In Transit / Tracking
          </h1>
          <p className="mt-1 text-[15px] font-medium leading-6 text-[#667085]">
            Monitor stock shipments across all locations
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <StatCard
            icon={<Truck className="h-[24px] w-[24px]" strokeWidth={2.2} />}
            title="In Transit"
            value={String(item.status).toLowerCase() === "in_transit" ? 1 : 0}
            iconWrapClass="bg-[#F3E8FF]"
            iconClass="text-[#9333EA]"
          />
          <StatCard
            icon={<CheckCircle2 className="h-[24px] w-[24px]" strokeWidth={2.2} />}
            title="Shipments"
            value={1}
            iconWrapClass="bg-[#DCFCE7]"
            iconClass="text-[#16A34A]"
          />
          <StatCard
            icon={<Package2 className="h-[24px] w-[24px]" strokeWidth={2.2} />}
            title="Goods Receipt"
            value={delivered ? 1 : 0}
            iconWrapClass="bg-[#DBEAFE]"
            iconClass="text-[#2563EB]"
          />
        </div>

        <div className="mt-7 rounded-[30px] border border-[#E5E7EB] bg-white px-6 py-6 shadow-[0px_1px_2px_rgba(16,24,40,0.04)]">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_378px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="break-all text-[20px] font-semibold leading-[30px] tracking-[-0.03em] text-[#111827] md:text-[22px]">
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
                  shippedDate={formatDate(item.dispatch_date || item.transfer_date)}
                  expectedDelivery={formatDate(item.expected_delivery_date)}
                />
              </div>

              <button
                type="button"
                onClick={() => setOpenPartner((prev) => !prev)}
                className="mt-8 inline-flex items-center gap-3"
              >
                <UserRound className="h-[20px] w-[20px] text-[#16A34A]" />
                <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
                  Delivery Partner Details
                </span>
                {openPartner ? (
                  <ChevronUp className="h-[18px] w-[18px] text-[#111827]" />
                ) : (
                  <ChevronDown className="h-[18px] w-[18px] text-[#111827]" />
                )}
              </button>

              {openPartner ? (
                <>
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-[72px_repeat(4,minmax(0,1fr))]">
                    <div className="flex h-[58px] w-[58px] items-center justify-center overflow-hidden rounded-[12px] bg-[#D9D9D9]">
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
                    <PartnerInfo label="Vehicle Number *" value={vehicleNumber} />
                    <PartnerInfo label="Tracking Number" value={trackingValue} />
                  </div>

                  <div className="mt-8 h-px bg-[#E5E7EB]" />

                  <div className="mt-5">
                    <h3 className="text-[15px] font-semibold text-[#344054]">
                      Products in Transit:
                    </h3>

                    {item.transfer_items?.length ? (
                      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
                        <div className="space-y-4">
                          {item.transfer_items.map((product) => (
                            <ProductAccordionCard
                              key={product.id}
                              product={product}
                              open={!!expandedItems[product.id]}
                              onToggle={() => toggleItem(product.id)}
                            />
                          ))}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                          {item.media?.dispatch_image_url ? (
                            <MediaImage
                              src={item.media.dispatch_image_url}
                              alt="Dispatch image"
                            />
                          ) : null}

                          {item.media?.receive_image_url ? (
                            <MediaImage
                              src={item.media.receive_image_url}
                              alt="Receive image"
                            />
                          ) : null}

                          {item.media?.dispatch_video_url ? (
                            <MediaVideo src={item.media.dispatch_video_url} />
                          ) : null}

                          {!mediaAvailable ? (
                            <div className="col-span-full flex min-h-[156px] items-center justify-center rounded-[22px] border border-dashed border-[#D0D5DD] bg-[#F8FAFC] px-4 text-center text-[14px] text-[#667085]">
                              No dispatch media available.
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-[18px] border border-dashed border-[#D0D5DD] bg-[#F8FAFC] p-4 text-[14px] text-[#667085]">
                        No product items available.
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="flex flex-col gap-5">
                <div className="flex justify-start xl:justify-end">
                  <button
                    type="button"
                    onClick={handleMarkDelivered}
                    disabled={!canMarkDelivered(item.status) || marking || delivered}
                    className="inline-flex h-[50px] items-center gap-2 rounded-[12px] bg-[#12B76A] px-5 text-[15px] font-semibold text-white shadow-[0px_6px_14px_rgba(18,183,106,0.18)] transition-colors hover:bg-[#0ea760] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-[18px] w-[18px]" />
                    {marking ? "Updating..." : delivered ? "Delivered" : "Mark Delivered"}
                  </button>
                </div>

                <TransitGoogleMap
                  item={item}
                  clickable
                  onClick={() => setMapOpen(true)}
                  height={248}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {mapOpen ? (
        <MapFullscreenModal item={item} onClose={() => setMapOpen(false)} />
      ) : null}
    </>
  );
}

function PartnerInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[13px] font-medium leading-5 text-[#111827]">{label}</div>
      <div className="mt-1 truncate text-[13px] leading-5 text-[#667085]">{value}</div>
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
    <div className="overflow-hidden rounded-[18px] border border-[#EAECF0] bg-[#F8FAFC]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <div className="min-w-0">
          <div className="truncate text-[15px] font-medium text-[#111827]">
            {product.item_name}
          </div>
          <div className="mt-1 text-[14px] text-[#667085]">
            Quantity: {product.quantity}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#111827] transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="border-t border-[#EAECF0] px-4 py-4">
          <div className="grid grid-cols-2 gap-3 text-[13px] text-[#667085]">
            <InfoMini label="Category" value={product.category_name || "—"} />
            <InfoMini label="SKU" value={product.sku || "—"} />
            <InfoMini label="Purity" value={product.purity || "—"} />
            <InfoMini
              label="Weight"
              value={product.weight !== undefined ? String(product.weight) : "—"}
            />
            <InfoMini label="Article Code" value={product.article_code || "—"} />
            <InfoMini label="Remarks" value={product.remarks || "—"} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InfoMini({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[12px] font-medium text-[#98A2B3]">{label}</div>
      <div className="mt-1 truncate text-[13px] font-medium text-[#344054]">{value}</div>
    </div>
  );
}

function MediaImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[22px] bg-[#F8FAFC] shadow-[0px_1px_2px_rgba(16,24,40,0.04)]">
      <img src={src} alt={alt} className="h-[156px] w-full object-cover" />
    </div>
  );
}

function MediaVideo({ src }: { src: string }) {
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-[#F8FAFC] shadow-[0px_1px_2px_rgba(16,24,40,0.04)]">
      <video
        src={src}
        className="h-[156px] w-full object-cover"
        controls
        preload="metadata"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-md">
          <Play className="ml-0.5 h-5 w-5 text-[#111827]" />
        </div>
      </div>
    </div>
  );
}

function MapFullscreenModal({
  item,
  onClose,
}: {
  item: TransitTransfer;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] bg-black/35 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="flex h-full w-full items-center justify-center px-4 py-6 md:px-8">
        <div
          className="relative w-full max-w-[1080px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-[-62px] z-10 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white shadow-[0px_12px_30px_rgba(16,24,40,0.16)] transition-transform hover:scale-[1.02]"
            aria-label="Close map"
          >
            <X className="h-[24px] w-[24px] text-[#111827]" />
          </button>

          <div className="overflow-hidden rounded-[32px] bg-white shadow-[0px_24px_60px_rgba(16,24,40,0.18)]">
            <TransitGoogleMap item={item} height={770} large />
          </div>
        </div>
      </div>
    </div>
  );
}