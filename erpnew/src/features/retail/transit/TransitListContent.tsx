"use client";

import Link from "next/link";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Package2,
  Truck,
} from "lucide-react";
import { getTransitTransfers, markTransferReceived } from "./api";
import {
  DateInfo,
  DeliveryPartnerDetails,
  LocationRow,
  RoutePill,
  StatCard,
  StatusPill,
  TransitPageHeader,
} from "./TransitShared";
import TransitGoogleMap from "./TransitGoogleMap";
import TransitMapModal from "./TransitMapModal";
import type { TransitTransfer } from "./types";
import {
  canMarkDelivered,
  formatDate,
  getRouteLabel,
  getStatusLabel,
  isDeliveredStatus,
  isInTransitStatus,
} from "./utils";

type SummaryState = {
  in_transit: number;
  shipments: number;
  goods_receipt: number;
};

const getMovementLabel = (item: TransitTransfer) => {
  const type = (item as any).movement_type;
  if (type === "receive") return "Incoming";
  if (type === "send") return "Outgoing";
  return "";
};

const isReceive = (item: TransitTransfer) =>
  (item as any).movement_type === "receive";

export default function TransitListContent({
  basePath = "/retail/transit",
}: {
  basePath?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<TransitTransfer[]>([]);
  const [summary, setSummary] = useState<SummaryState>({
    in_transit: 0,
    shipments: 0,
    goods_receipt: 0,
  });
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState<number | null>(null);
  const [selectedMapItem, setSelectedMapItem] =
    useState<TransitTransfer | null>(null);

  async function loadTransfers() {
    try {
      setLoading(true);
      setError("");

      const res = await getTransitTransfers();
      const safeItems = Array.isArray(res?.data) ? res.data : [];

      setItems(safeItems);
      setSummary({
        in_transit: Number(res?.summary?.in_transit ?? 0),
        shipments: Number(res?.summary?.shipments ?? 0),
        goods_receipt: Number(res?.summary?.goods_receipt ?? 0),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transfers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransfers();
  }, []);

  const activeShipments = useMemo(() => {
    return items.filter(
      (item) => isInTransitStatus(item.status) || isDeliveredStatus(item.status)
    );
  }, [items]);

  const handleMarkDelivered = async (
    event: MouseEvent<HTMLButtonElement>,
    item: TransitTransfer
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!canMarkDelivered(item.status)) return;

    try {
      setMarkingId(item.id);
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

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[108px] animate-pulse rounded-erp-xl border border-erp-border bg-white shadow-erp-card"
            />
          ))}
        </div>

        <div className="mt-7 h-[260px] animate-pulse rounded-erp-2xl border border-erp-border bg-white shadow-erp-card" />
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-w-0 font-erp">
        <TransitPageHeader />

        {error ? (
          <div className="mt-5 rounded-erp-lg border border-red-200 bg-red-50 p-4 text-[14px] font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <StatCard
            icon={<Truck className="h-6 w-6" />}
            title="In Transit"
            value={summary.in_transit}
            iconWrapClass="bg-erp-purple-soft"
            iconClass="text-erp-purple"
          />

          <StatCard
            icon={<CheckCircle2 className="h-6 w-6" />}
            title="Shipments"
            value={summary.shipments}
            iconWrapClass="bg-erp-success-soft"
            iconClass="text-erp-success"
          />

          <StatCard
            icon={<Package2 className="h-6 w-6" />}
            title="Goods Receipt"
            value={summary.goods_receipt}
            iconWrapClass="bg-erp-blue-soft"
            iconClass="text-erp-primary"
          />
        </section>

        <section className="mt-7">
          <h2 className="erp-section-title">Active Shipments</h2>

          <div className="mt-5 space-y-5">
            {activeShipments.length ? (
              activeShipments.map((item) => {
                const delivered = isDeliveredStatus(item.status);
                const trackingValue =
                  item.tracking_number || item.transfer_no || `TRK-${item.id}`;

                return (
                  <article
                    key={item.id}
                    className="rounded-erp-2xl border border-erp-border bg-white px-6 py-6 shadow-erp-card"
                  >
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <Link
                            href={`${basePath}/${item.id}`}
                            className="break-all text-[20px] font-semibold leading-[30px] tracking-[-0.03em] text-erp-heading md:text-[22px]"
                          >
                            Tracking: {trackingValue}
                          </Link>

                          <StatusPill delivered={delivered}>
                            {getStatusLabel(item.status)}
                          </StatusPill>

                          {/* ✅ UPDATED */}
                          <RoutePill>
                            {getRouteLabel(item)} • {getMovementLabel(item)}
                          </RoutePill>
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
                            expectedDelivery={formatDate(
                              item.expected_delivery_date
                            )}
                          />
                        </div>

                        <div className="mt-7">
                          <DeliveryPartnerDetails item={item} />
                        </div>

                        <Link
                          href={`${basePath}/${item.id}`}
                          className="mt-5 inline-flex items-center gap-1 text-[14px] font-semibold text-erp-primary"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>

                      <div className="flex min-w-0 flex-col gap-5">
                        <div className="flex justify-start xl:justify-end">
                          {/* ✅ ONLY FOR RECEIVE */}
                          {isReceive(item) && (
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
                              className="inline-flex h-[44px] items-center justify-center gap-2 rounded-erp-sm bg-erp-success px-5 text-[15px] font-semibold text-white shadow-erp-card transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <BadgeCheck className="h-[18px] w-[18px]" />
                              {markingId === item.id
                                ? "Updating..."
                                : delivered
                                ? "Delivered"
                                : "Mark Delivered"}
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedMapItem(item)}
                          className="block h-[250px] w-full overflow-hidden rounded-[24px] bg-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:scale-[1.01]"
                          aria-label={`Open live map for ${trackingValue}`}
                        >
                          <TransitGoogleMap item={item} height={250} preview />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-erp-2xl border border-dashed border-erp-border bg-white p-8 text-[15px] text-erp-muted shadow-erp-card">
                No active shipments available.
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