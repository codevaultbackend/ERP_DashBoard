"use client";

import Link from "next/link";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Package2,
  RefreshCw,
  Truck,
} from "lucide-react";


import { getTransitTransfers, markTransferReceived } from "./api";
import {
  DateInfo,
  DeliveryPartnerDetails,
  DirectionPill,
  LocationRow,
  RoutePill,
  StatCard,
  StatusPill,
  TransitDirectionToggle,
  TransitPageHeader,
} from "./TransitShared";
import TransitGoogleMap from "./TransitGoogleMap";
import TransitMapModal from "./TransitMapModal";
import type { TransitDirection, TransitTransfer } from "./types";
import {
  canMarkDelivered,
  formatDate,
  getRouteLabel,
  getStatusLabel,
  isDeliveredStatus,
  isInTransitStatus,
} from "./utils";
import { isHeadOfficeUser } from "@/core/auth/permissions";

type SummaryState = {
  in_transit: number;
  shipments: number;
  goods_receipt: number;
};

function getTrackingValue(item: TransitTransfer) {
  return item.tracking_number || item.transfer_no || `TRK-${item.id}`;
}

function isIncoming(item: TransitTransfer) {
  return item.direction === "incoming";
}

function isOutgoing(item: TransitTransfer) {
  return item.direction === "outgoing";
}

function getEmptyMessage(activeTab: TransitDirection) {
  if (activeTab === "incoming") {
    return "No arriving stock is currently available.";
  }

  return "No dispatched stock is currently available.";
}

export default function TransitListContent({
  basePath = "/retail/transit",
}: {
  basePath?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<
    TransitTransfer[]
  >([]);
  const [summary, setSummary] = useState<SummaryState>({
    in_transit: 0,
    shipments: 0,
    goods_receipt: 0,
  });

  const [activeTab, setActiveTab] = useState<TransitDirection>("incoming");
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [selectedMapItem, setSelectedMapItem] =
    useState<TransitTransfer | null>(null);

  async function loadTransfers() {
    try {
      setLoading(true);
      setError("");

      const res = await getTransitTransfers();

      const safeItems = Array.isArray(res?.data)
        ? res.data
        : [];

      setItems(safeItems);

      setSummary({
        in_transit: Number(
          res?.summary?.in_transit ?? 0
        ),
        shipments: Number(
          res?.summary?.shipments ?? 0
        ),
        goods_receipt: Number(
          res?.summary?.goods_receipt ?? 0
        ),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transfers"
      );

      setItems([]);

      setSummary({
        in_transit: 0,
        shipments: 0,
        goods_receipt: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransfers();
  }, []);

  const incomingCount = useMemo(
    () =>
      items.filter(
        (item) =>
          item.direction === "incoming"
      ).length,
    [items]
  );

  const outgoingCount = useMemo(
    () =>
      items.filter(
        (item) =>
          item.direction === "outgoing"
      ).length,
    [items]
  );

  const activeShipments = useMemo(() => {
    return items.filter(
      (item) =>
        item.direction === activeTab
    );
  }, [items, activeTab]);

  const handleMarkDelivered = async (
    event: MouseEvent<HTMLButtonElement>,
    item: TransitTransfer
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isIncoming(item)) return;
    if (!canMarkDelivered(item.status)) return;

    try {
      setMarkingId(item.id);
      setError("");

      await markTransferReceived(item.id);
      await loadTransfers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update transfer");
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-w-0 font-erp">
        <TransitPageHeader />

        <section className="mt-[22px] grid grid-cols-1 gap-[28px] md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[108px] animate-pulse rounded-[28px] border border-erp-border bg-white shadow-erp-card"
            />
          ))}
        </section>

        <div className="mt-[28px] h-[244px] animate-pulse rounded-[28px] border border-erp-border bg-white shadow-erp-card" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-w-0 font-erp">
        <TransitPageHeader />

        {error ? (
          <div className="mt-[18px] flex items-start justify-between gap-3 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={loadTransfers}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-red-700 shadow-sm"
            >
              <RefreshCw className="h-[14px] w-[14px]" />
              Retry
            </button>
          </div>
        ) : null}

        <section className="mt-[22px] grid grid-cols-1 gap-[28px] md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            icon={<Truck className="h-[24px] w-[24px]" />}
            title="On The Way"
            value={summary.in_transit}
            iconWrapClass="bg-erp-purple-soft"
            iconClass="text-erp-purple"
          />

          <StatCard
            icon={<CheckCircle2 className="h-[24px] w-[24px]" />}
            title="Ready To Dispatch"
            value={summary.shipments}
            iconWrapClass="bg-erp-success-soft"
            iconClass="text-erp-success"
          />

          <StatCard
            icon={<Package2 className="h-[24px] w-[24px]" />}
            title="Reached"
            value={summary.goods_receipt}
            iconWrapClass="bg-erp-blue-soft"
            iconClass="text-erp-primary"
          />
        </section>

        <section className="mt-[32px]">
          <div className="flex flex-col gap-[18px] lg:flex-row lg:items-center lg:justify-between">
            <h2 className="erp-section-title">Active Shipments</h2>
            <TransitDirectionToggle
              value={activeTab}
              onChange={setActiveTab}
              incomingCount={incomingCount}
              outgoingCount={outgoingCount}
            />
          </div>

          <div className="mt-[28px] space-y-[20px]">
            {activeShipments.length ? (
              activeShipments.map((item) => {
                const delivered = isDeliveredStatus(item.status);
                const trackingValue = getTrackingValue(item);
                const incoming = isIncoming(item);

                return (
                  <article
                    key={`${item.direction}-${item.id}`}
                    className="rounded-[28px] border border-erp-border bg-white px-[26px] py-[24px] shadow-erp-card"
                  >
                    <div className="grid grid-cols-1 gap-[24px] xl:grid-cols-[minmax(0,1fr)_390px]">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-[12px]">
                          <Link
                            href={`${basePath}/${item.id}`}
                            className="break-all text-[20px] font-semibold leading-[26px] tracking-[-0.04em] text-erp-heading transition hover:text-erp-primary"
                          >
                            Tracking: {trackingValue}
                          </Link>

                          <StatusPill delivered={delivered}>
                            {getStatusLabel(item.status)}
                          </StatusPill>

                          <DirectionPill direction={item.direction} />

                          <RoutePill>{getRouteLabel(item)}</RoutePill>
                        </div>

                        <div className="mt-[20px] max-w-[650px]">
                          <LocationRow
                            from={item.from_organization_name || "—"}
                            to={item.to_organization_name || "—"}
                          />
                        </div>

                        <div className="mt-[20px] max-w-[650px]">
                          <DateInfo
                            shippedDate={formatDate(
                              item.dispatch_date || item.transfer_date
                            )}
                            expectedDelivery={formatDate(
                              item.expected_delivery_date
                            )}
                          />
                        </div>

                        <div className="mt-[26px]">
                          <DeliveryPartnerDetails item={item} />
                        </div>

                        <Link
                          href={`${basePath}/${item.id}`}
                          className="mt-[16px] inline-flex items-center gap-[4px] text-[14px] font-semibold leading-[18px] text-erp-primary transition hover:text-erp-primary-hover"
                        >
                          View Details
                          <ChevronRight className="h-[15px] w-[15px]" />
                        </Link>
                      </div>

                      <div className="flex min-w-0 flex-col gap-[22px]">
                        <div className="flex h-[44px] items-center justify-start xl:justify-end">
                          {incoming ? (
                            <button
                              type="button"
                              onClick={(event) =>
                                handleMarkDelivered(event, item)
                              }
                              disabled={
                                delivered ||
                                markingId === item.id ||
                                !canMarkDelivered(item.status)
                              }
                              className="inline-flex h-[42px] items-center justify-center gap-[8px] rounded-[12px] bg-erp-success px-[18px] text-[15px] font-semibold leading-[20px] tracking-[-0.02em] text-white shadow-erp-card transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <BadgeCheck className="h-[18px] w-[18px]" />
                              {markingId === item.id
                                ? "Updating..."
                                : delivered
                                  ? "Delivered"
                                  : "Mark Delivered"}
                            </button>
                          ) : (
                            <span className="inline-flex h-[42px] items-center justify-center rounded-[12px] border border-erp-border bg-erp-card-soft px-[18px] text-[15px] font-semibold leading-[20px] tracking-[-0.02em] text-erp-muted">
                              Dispatched Stock
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedMapItem(item)}
                          className="block h-[132px] w-full overflow-hidden rounded-[24px] bg-white text-left shadow-[0px_8px_24px_rgba(15,23,42,0.08)] transition hover:scale-[1.01]"
                          aria-label={`Open live map for ${trackingValue}`}
                        >
                          <TransitGoogleMap item={item} height={132} preview />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[28px] border border-dashed border-erp-border bg-white p-[28px] text-[15px] font-medium text-erp-muted shadow-erp-card">
                {getEmptyMessage(activeTab)}
              </div>
            )}
          </div>
        </section>
      </div>

      <TransitMapModal
        open={!!selectedMapItem}
        item={selectedMapItem}
        onClose={() => setSelectedMapItem(null)}
      />
    </>
  );
}