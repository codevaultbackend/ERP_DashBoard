"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Package2,
  Truck,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import { getTransitTransfers } from "./api";
import {
  TransitPageHeader,
  StatCard,
  StatusPill,
  RoutePill,
  LocationRow,
  DateInfo,
  DeliveryPartnerDetails,
} from "./TransitShared";
import TransitGoogleMap from "./TransitGoogleMap";
import type { TransitTransfer } from "./types";
import {
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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getTransitTransfers();

        if (!mounted) return;

        const safeItems = Array.isArray(res?.data) ? res.data : [];

        setItems(safeItems);
        setSummary({
          in_transit: Number(res?.summary?.in_transit ?? 0),
          shipments: Number(res?.summary?.shipments ?? 0),
          goods_receipt: Number(res?.summary?.goods_receipt ?? 0),
        });
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Failed to load transfers");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const activeShipments = useMemo(() => {
    return items.filter(
      (item) => isInTransitStatus(item?.status) || isDeliveredStatus(item?.status)
    );
  }, [items]);

  if (loading) {
    return (
      <div className="w-full min-w-0">
        <TransitPageHeader />

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[108px] animate-pulse rounded-[26px] border border-[#E5E7EB] bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.04)]"
            />
          ))}
        </div>

        <div className="mt-7">
          <div className="h-8 w-56 animate-pulse rounded-xl bg-white" />
          <div className="mt-5 space-y-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-[248px] animate-pulse rounded-[30px] border border-[#E5E7EB] bg-white shadow-[0px_1px_2px_rgba(16,24,40,0.04)]"
              />
            ))}
          </div>
        </div>
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

  return (
    <div className="w-full min-w-0">
      <TransitPageHeader />

      <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
        <StatCard
          icon={<Truck className="h-[24px] w-[24px]" strokeWidth={2.2} />}
          title="In Transit"
          value={summary.in_transit}
          iconWrapClass="bg-[#F3E8FF]"
          iconClass="text-[#9333EA]"
        />
        <StatCard
          icon={<CheckCircle2 className="h-[24px] w-[24px]" strokeWidth={2.2} />}
          title="Shipments"
          value={summary.shipments}
          iconWrapClass="bg-[#DCFCE7]"
          iconClass="text-[#16A34A]"
        />
        <StatCard
          icon={<Package2 className="h-[24px] w-[24px]" strokeWidth={2.2} />}
          title="Goods Receipt"
          value={summary.goods_receipt}
          iconWrapClass="bg-[#DBEAFE]"
          iconClass="text-[#2563EB]"
        />
      </section>

      <section className="mt-7">
        <h2 className="text-[22px] font-semibold leading-[30px] tracking-[-0.03em] text-[#111827]">
          Active Shipments
        </h2>

        <div className="mt-5 space-y-5">
          {activeShipments.length > 0 ? (
            activeShipments.map((item) => {
              const delivered = isDeliveredStatus(item?.status);
              const trackingValue =
                item?.tracking_number || item?.transfer_no || item?.id || "N/A";

              return (
                <Link
                  key={String(item?.id ?? trackingValue)}
                  href={`${basePath}/${item?.id}`}
                  className="group block rounded-[30px] border border-[#E5E7EB] bg-white px-6 py-6 shadow-[0px_1px_2px_rgba(16,24,40,0.04)] transition-all duration-200 hover:shadow-[0px_12px_30px_rgba(16,24,40,0.08)]"
                >
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_364px]">
                    <div className="min-w-0">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="break-all text-[20px] font-semibold leading-[30px] tracking-[-0.03em] text-[#111827] md:text-[22px]">
                            Tracking: {trackingValue}
                          </h3>

                          <StatusPill delivered={delivered}>
                            {getStatusLabel(item?.status)}
                          </StatusPill>

                          <RoutePill>{getRouteLabel(item)}</RoutePill>

                          <div className="ml-auto hidden items-center gap-2 rounded-[12px] bg-[#12B76A] px-4 py-[10px] text-[14px] font-semibold text-white xl:inline-flex">
                            <BadgeCheck className="h-[18px] w-[18px]" />
                            {delivered ? "Delivered" : "Mark Delivered"}
                          </div>
                        </div>

                        <LocationRow
                          from={item?.from_organization_name || "—"}
                          to={item?.to_organization_name || "—"}
                        />

                        <DateInfo
                          shippedDate={formatDate(
                            item?.dispatch_date || item?.transfer_date
                          )}
                          expectedDelivery={formatDate(item?.expected_delivery_date)}
                        />

                        <div className="flex flex-wrap items-center gap-3">
                          <DeliveryPartnerDetails item={item} />

                          <div className="ml-auto inline-flex items-center gap-1 text-[14px] font-semibold text-[#344054]">
                            View Details
                            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </div>
                        </div>

                        <div className="inline-flex w-fit items-center gap-2 rounded-[12px] bg-[#12B76A] px-4 py-[10px] text-[14px] font-semibold text-white xl:hidden">
                          <BadgeCheck className="h-[18px] w-[18px]" />
                          {delivered ? "Delivered" : "Mark Delivered"}
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <TransitGoogleMap item={item} />
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-[30px] border border-dashed border-[#D0D5DD] bg-white p-8 text-[15px] text-[#667085] shadow-[0px_1px_2px_rgba(16,24,40,0.03)]">
              No active shipments available.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}