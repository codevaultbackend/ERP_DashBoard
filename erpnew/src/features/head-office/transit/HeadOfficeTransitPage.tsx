

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Package2,
  RefreshCw,
  Search,
  Store,
  Truck,
} from "lucide-react";

import {
  getHeadAllTransfers,
  getOrganizationsByLevel,
} from "./api";

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
import FilterDropdown from "./FilterDropdown";

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
  const [initialLoading, setInitialLoading] =
    useState(true);

  const [tableLoading, setTableLoading] =
    useState(false);
  const [searchInput, setSearchInput] =
    useState("");

  const [items, setItems] = useState<
    TransitTransfer[]
  >([]);

  const [error, setError] =
    useState("");
  const [districtStores, setDistrictStores] =
    useState<any[]>([]);

  const [retailStores, setRetailStores] =
    useState<any[]>([]);

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
    });

  async function loadTransfers() {
    try {
      if (items.length === 0) {
        setInitialLoading(true);
      } else {
        setTableLoading(true);
      }
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
      setInitialLoading(false);
      setTableLoading(false);
    }
  }
  async function loadStores() {
    try {
      const [districtRes, retailRes] =
        await Promise.all([
          getOrganizationsByLevel(
            "district"
          ),
          getOrganizationsByLevel(
            "retail"
          ),
        ]);

      setDistrictStores(
        Array.isArray(
          districtRes?.data
        )
          ? districtRes.data
          : []
      );

      setRetailStores(
        Array.isArray(
          retailRes?.data
        )
          ? retailRes.data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load stores",
        err
      );

      setDistrictStores([]);
      setRetailStores([]);
    }
  }

  useEffect(() => {
    loadTransfers();
  }, [filters]);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput,
      }));
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchInput]);

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


  if (initialLoading) {
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



        <section className="mt-[22px] grid  gap-[20px] grid-cols-2 xl:grid-cols-3 lg:grid-cols-3">
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
        </section>
        <section
          className="
    mt-6
    rounded-[24px]
    border
    border-erp-border
    bg-white
    p-5
    lg:p-6
    shadow-erp-card
  "
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[280px]">
              <Search
                className="
        absolute
        left-4
        top-1/2
        h-5
        w-5
        -translate-y-1/2
        text-erp-muted
      "
              />

              <input
                value={searchInput}
                onChange={(e) =>
                  setSearchInput(e.target.value)
                }
                placeholder="Search Tracking ID, District Store or Retail Store..."
                className="
        h-14
        w-full
        rounded-full
        border
        border-erp-border
        bg-[#F8FAFC]
        pl-12
        pr-4
        text-sm
        outline-none
        transition
        focus:border-erp-primary
        focus:ring-2
        focus:ring-erp-primary/10
      "
              />
            </div>

            {/* Transit */}
            <div className="!w-full lg:w-[180px]">
              <FilterDropdown
                value={filters.status}
                placeholder="All Transits"
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
                options={[
                  {
                    label: "All Transits",
                    value: "all",
                  },
                  {
                    label: "My Transits",
                    value: "my_transits",
                  },
                ]}
              />
            </div>

            {/* District */}
            <div className="w-full lg:w-[220px]">
              <FilterDropdown
                value={filters.district_store_code}
                placeholder="District Store"
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    district_store_code: value,
                    retail_store_code: "all",
                  }))
                }
                options={[
                  {
                    label: "District Store",
                    value: "all",
                  },
                  ...districtStores.map((store) => ({
                    label: store.store_name,
                    value: store.store_code,
                  })),
                ]}
              />
            </div>

            {/* Retail */}
            <div className="w-full lg:w-[220px]">
              <FilterDropdown
                value={filters.retail_store_code}
                placeholder="Retail Store"
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    district_store_code: "all",
                    retail_store_code: value,
                  }))
                }
                options={[
                  {
                    label: "Retail Store",
                    value: "all",
                  },
                  ...retailStores.map((store) => ({
                    label: store.store_name,
                    value: store.store_code,
                  })),
                ]}
              />
            </div>
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
                                item.from_store_name
                                  ? `${item.from_store_name} (${item.from_store_level})`
                                  : "—"
                              }
                              to={
                                item.to_store_name
                                  ? `${item.to_store_name} (${item.to_store_level})`
                                  : "—"
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

