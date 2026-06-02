"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Package2,
  RefreshCw,
  Store,
  Truck,
} from "lucide-react";

import { getHeadAllTransfers } from "./api";

import {
  DateInfo,
  DeliveryPartnerDetails,
  LocationRow,
  RoutePill,
  StatCard,
  StatusPill,
  TransitPageHeader,
} from "../../retail/transit/TransitShared";

import TransitGoogleMap from "../../retail/transit/TransitGoogleMap";

import TransitMapModal from "../../retail/transit/TransitMapModal";

import type { TransitTransfer } from "../../retail/transit/types";

import {
  formatDate,
  getStatusLabel,
  isDeliveredStatus,
  isInTransitStatus,
} from "../../retail/transit/utils";

type SummaryState = {
  total: number;
  inTransit: number;
  shipments: number;
  goodsReceipt: number;
  districtTransfers: number;
  retailTransfers: number;
};

function getTrackingValue(item: TransitTransfer) {
  return (
    item.tracking_number ||
    item.transfer_no ||
    `TRK-${item.id}`
  );
}

export default function HeadOfficeTransitPage({
  basePath = "/head-office/transit",
}: {
  basePath?: string;
}) {
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<
    TransitTransfer[]
  >([]);

  const [error, setError] =
    useState("");

  const [selectedMapItem, setSelectedMapItem] =
    useState<TransitTransfer | null>(
      null
    );

  const [summary, setSummary] =
    useState<SummaryState>({
      total: 0,
      inTransit: 0,
      shipments: 0,
      goodsReceipt: 0,
      districtTransfers: 0,
      retailTransfers: 0,
    });

  const [filters, setFilters] =
    useState({
      search: "",
      status: "all",

      district_store_code: "all",
      retail_store_code: "all",

      from_store_code: "all",
      to_store_code: "all",
    });

  async function loadTransfers() {
    try {
      setLoading(true);
      setError("");

      const res =
        await getHeadAllTransfers(
          filters
        );

      const safeItems = Array.isArray(
        res?.data
      )
        ? res.data
        : [];

      setItems(safeItems);

      setSummary({
        total: Number(
          res?.summary?.total ?? 0
        ),

        inTransit: Number(
          res?.summary?.inTransit ?? 0
        ),

        shipments: Number(
          res?.summary?.shipments ?? 0
        ),

        goodsReceipt: Number(
          res?.summary?.goodsReceipt ?? 0
        ),

        districtTransfers: Number(
          res?.summary
            ?.districtTransfers ?? 0
        ),

        retailTransfers: Number(
          res?.summary
            ?.retailTransfers ?? 0
        ),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load transfers"
      );

      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransfers();
  }, [filters]);

  const activeShipments = useMemo(() => {
    return items.filter((item) => {
      return (
        isInTransitStatus(
          item.status
        ) ||
        isDeliveredStatus(
          item.status
        )
      );
    });
  }, [items]);

  if (loading) {
    return (
      <div className="w-full min-w-0 font-erp">
        <TransitPageHeader />

        <section className="mt-[22px] grid grid-cols-1 gap-[20px] md:grid-cols-2 xl:grid-cols-5">
          {Array.from({
            length: 5,
          }).map((_, index) => (
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

        {/* FILTER BAR */}

        <section className="mt-[24px] rounded-[28px] border border-erp-border bg-white p-[22px] shadow-erp-card">
          <div className="grid grid-cols-1 gap-[16px] md:grid-cols-2 xl:grid-cols-6">
            <input
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search:
                    e.target.value,
                }))
              }
              placeholder="Search tracking / driver"
              className="h-[48px] rounded-[14px] border border-erp-border px-[16px] outline-none"
            />

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status:
                    e.target.value,
                }))
              }
              className="h-[48px] rounded-[14px] border border-erp-border px-[14px]"
            >
              <option value="all">
                All Status
              </option>

              <option value="approved">
                Approved
              </option>

              <option value="dispatched">
                Dispatched
              </option>

              <option value="in_transit">
                In Transit
              </option>

              <option value="received">
                Received
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>

            <input
              value={
                filters.district_store_code
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  district_store_code:
                    e.target.value,
                }))
              }
              placeholder="District Store"
              className="h-[48px] rounded-[14px] border border-erp-border px-[16px]"
            />

            <input
              value={
                filters.retail_store_code
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  retail_store_code:
                    e.target.value,
                }))
              }
              placeholder="Retail Store"
              className="h-[48px] rounded-[14px] border border-erp-border px-[16px]"
            />

            <input
              value={
                filters.from_store_code
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  from_store_code:
                    e.target.value,
                }))
              }
              placeholder="From Store"
              className="h-[48px] rounded-[14px] border border-erp-border px-[16px]"
            />

            <input
              value={
                filters.to_store_code
              }
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  to_store_code:
                    e.target.value,
                }))
              }
              placeholder="To Store"
              className="h-[48px] rounded-[14px] border border-erp-border px-[16px]"
            />
          </div>
        </section>

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

        {/* SUMMARY CARDS */}

        <section className="mt-[22px] grid grid-cols-1 gap-[20px] md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            icon={
              <Truck className="h-[24px] w-[24px]" />
            }
            title="In Transit"
            value={summary.inTransit}
            iconWrapClass="bg-erp-purple-soft"
            iconClass="text-erp-purple"
          />

          <StatCard
            icon={
              <CheckCircle2 className="h-[24px] w-[24px]" />
            }
            title="Shipments"
            value={summary.shipments}
            iconWrapClass="bg-erp-success-soft"
            iconClass="text-erp-success"
          />

          <StatCard
            icon={
              <Package2 className="h-[24px] w-[24px]" />
            }
            title="Goods Receipt"
            value={summary.goodsReceipt}
            iconWrapClass="bg-erp-blue-soft"
            iconClass="text-erp-primary"
          />

          <StatCard
            icon={
              <Store className="h-[24px] w-[24px]" />
            }
            title="District Transfers"
            value={
              summary.districtTransfers
            }
            iconWrapClass="bg-orange-100"
            iconClass="text-orange-600"
          />

          <StatCard
            icon={
              <Store className="h-[24px] w-[24px]" />
            }
            title="Retail Transfers"
            value={
              summary.retailTransfers
            }
            iconWrapClass="bg-pink-100"
            iconClass="text-pink-600"
          />
        </section>

        {/* SHIPMENTS */}

        <section className="mt-[32px]">
          <div className="flex items-center justify-between">
            <h2 className="erp-section-title">
              Active Shipments
            </h2>

            <div className="rounded-full bg-erp-card-soft px-[16px] py-[10px] text-[14px] font-semibold text-erp-heading">
              Total: {activeShipments.length}
            </div>
          </div>

          <div className="mt-[28px] space-y-[20px]">
            {activeShipments.length ? (
              activeShipments.map(
                (item) => {
                  const delivered =
                    isDeliveredStatus(
                      item.status
                    );

                  const trackingValue =
                    getTrackingValue(
                      item
                    );

                  return (
                    <article
                      key={item.id}
                      className="rounded-[28px] border border-erp-border bg-white px-[26px] py-[24px] shadow-erp-card"
                    >
                      <div className="grid grid-cols-1 gap-[24px] xl:grid-cols-[minmax(0,1fr)_390px]">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-[12px]">
                            <Link
                              href={`${basePath}/${item.id}`}
                              className="break-all text-[20px] font-semibold leading-[26px] tracking-[-0.04em] text-erp-heading transition hover:text-erp-primary"
                            >
                              Tracking:{" "}
                              {
                                trackingValue
                              }
                            </Link>

                            <StatusPill
                              delivered={
                                delivered
                              }
                            >
                              {getStatusLabel(
                                item.status
                              )}
                            </StatusPill>

                            <RoutePill>
                              {item.transfer_type_label ||
                                "Transfer"}
                            </RoutePill>
                          </div>

                          <div className="mt-[20px] max-w-[650px]">
                            <LocationRow
                              from={
                                item.from_organization_name ||
                                "—"
                              }
                              to={
                                item.to_organization_name ||
                                "—"
                              }
                            />
                          </div>

                          <div className="mt-[20px] max-w-[650px]">
                            <DateInfo
                              shippedDate={formatDate(
                                item.dispatch_date ||
                                  item.transfer_date
                              )}
                              expectedDelivery={formatDate(
                                item.expected_delivery_date
                              )}
                            />
                          </div>

                          <div className="mt-[26px]">
                            <DeliveryPartnerDetails
                              item={
                                item
                              }
                            />
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
                          <div className="flex h-[44px] items-center justify-end">
                            <span className="inline-flex h-[42px] items-center justify-center rounded-[12px] border border-erp-border bg-erp-card-soft px-[18px] text-[15px] font-semibold leading-[20px] tracking-[-0.02em] text-erp-muted">
                              Head Office
                              Monitoring
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedMapItem(
                                item
                              )
                            }
                            className="block h-[132px] w-full overflow-hidden rounded-[24px] bg-white text-left shadow-[0px_8px_24px_rgba(15,23,42,0.08)] transition hover:scale-[1.01]"
                          >
                            <TransitGoogleMap
                              item={item}
                              height={
                                132
                              }
                              preview
                            />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )
            ) : (
              <div className="rounded-[28px] border border-dashed border-erp-border bg-white p-[28px] text-[15px] font-medium text-erp-muted shadow-erp-card">
                No active shipments
                available.
              </div>
            )}
          </div>
        </section>
      </div>

      <TransitMapModal
        open={
          !!selectedMapItem
        }
        item={
          selectedMapItem
        }
        onClose={() =>
          setSelectedMapItem(
            null
          )
        }
      />
    </>
  );
}

