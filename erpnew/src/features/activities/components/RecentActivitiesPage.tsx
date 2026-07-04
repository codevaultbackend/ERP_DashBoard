"use client";
import {
  ChevronDown,
  Check,
} from "lucide-react";
import {
  isHeadOfficeUser,
} from "@/core/auth/permissions"

import {
  Listbox,
  Transition,
} from "@headlessui/react";

import { Fragment } from "react";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  AlertCircle,
  BadgeIndianRupee,
  Clock3,
  FileText,
  Gem,
  Loader2,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Search,
  Send,
  Store,
  Truck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import {
  getOwnRecentActivities,
  getStoreWiseActivities,
  type DistrictActivity,
} from "../api/district-activities-api";

import {
  getOrganizationsByLevel,
  type Organization,
} from "../../head-office/staff-management/api/staff-management-api";

type UiActivity = {
  id: string;
  type: string;
  title: string;
  description: string;
  store: string;
  handledBy: string;
  time: string;
  date: string;
  ago: string;
  searchableText: string;
};

const API_FETCH_LIMIT = 500;
const CARD_HEIGHT = 132;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatTitle(value?: string) {
  if (!value) return "ACTIVITY";
  return value.replace(/_/g, " ").toUpperCase();
}

function formatDateTime(date?: string) {
  if (!date) return { time: "--:--", date: "--" };

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return { time: "--:--", date: "--" };

  return {
    time: d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
    date: d
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase(),
  };
}

function normalizeActivity(row: DistrictActivity): UiActivity {
  const dateSource = row.activity_at || row.created_at || row.updated_at;
  const dateTime = formatDateTime(dateSource);

  const title = formatTitle(row.title || row.activity_type || row.action);

  const description =
    row.description ||
    row.reference_no ||
    row.meta?.item_name ||
    "Activity performed";

  const store =
    row.main_store ||
    row.store_name ||
    row.meta?.store_name ||
    row.meta?.from_store_name ||
    row.meta?.to_store_name ||
    row.store_code ||
    "Main Store";

  const handledBy =
    row.handled_by ||
    row.meta?.handled_by ||
    row.meta?.created_by ||
    "System";

  return {
    id: `${row.source || "activity"}-${row.id}`,
    type: row.icon || row.activity_type || row.module_name || "activity",
    title,
    description,
    store,
    handledBy,
    time: dateTime.time,
    date: dateTime.date,
    ago: row.time_ago || "Just now",
    searchableText: [
      title,
      description,
      store,
      handledBy,
      row.reference_no,
      row.store_code,
      row.module_name,
      row.activity_type,
      row.action,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
  };
}

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isMobile;
}

function ActivityIcon({
  type,
  className,
}: {
  type: string;
  className: string;
}) {
  const lower = type.toLowerCase();

  if (lower.includes("bill") || lower.includes("billing")) {
    return <ReceiptText className={className} strokeWidth={2.15} />;
  }

  if (lower.includes("staff") || lower.includes("employee")) {
    return <UserRound className={className} strokeWidth={2.15} />;
  }

  if (lower.includes("request")) {
    return <Send className={className} strokeWidth={2.15} />;
  }

  if (lower.includes("transit") || lower.includes("transfer")) {
    return <Truck className={className} strokeWidth={2.15} />;
  }

  if (lower.includes("ledger")) {
    return <BadgeIndianRupee className={className} strokeWidth={2.15} />;
  }

  if (lower.includes("adjust")) {
    return <PackageCheck className={className} strokeWidth={2.15} />;
  }

  if (lower.includes("file") || lower.includes("document")) {
    return <FileText className={className} strokeWidth={2.15} />;
  }

  return <Gem className={className} strokeWidth={2.15} />;
}

function ActivityField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-[6px] text-[11px] font-semibold uppercase leading-[15px] tracking-[0.04em] text-[#585F6A] sm:text-[12px]">
        {icon}
        <span className="truncate">{label}</span>
      </div>

      <div className="mt-[7px] min-w-0 text-[13px] font-medium leading-[19px] tracking-[-0.02em] text-[#191C1E] sm:text-[14px] sm:leading-[20px]">
        {value}
      </div>
    </div>
  );
}

const ActivityCard = memo(function ActivityCard({ item }: { item: UiActivity }) {
  return (
    <article className="relative w-full rounded-[20px] border border-[#8FB4FF] bg-erp-card px-4 py-4 shadow-none sm:min-h-[95px] sm:rounded-[24px] sm:px-[22px] sm:py-[18px] xl:px-[28px] xl:py-[20px]">
      <div className="mb-3 flex justify-end text-[11px] font-medium leading-[14px] tracking-[-0.02em] text-[#A3A9B5] sm:absolute sm:right-[22px] sm:top-[18px] sm:mb-0 sm:text-[12px] xl:right-[24px] xl:top-[20px]">
        {item.ago}
      </div>

      <div className="grid gap-4 sm:pr-[86px] md:grid-cols-2 md:gap-x-6 md:gap-y-5 xl:grid-cols-[276px_220px_220px_minmax(230px,1fr)] xl:items-center xl:gap-[28px] xl:pr-[100px]">
        <div className="flex min-w-0 items-start gap-4 sm:items-center xl:gap-[34px]">
          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-[#E8F0FE]">
            <ActivityIcon
              type={item.type}
              className="h-[16px] w-[16px] text-[#1456C8]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-[5px] text-[11px] font-semibold uppercase leading-[15px] tracking-[0.04em] text-[#585F6A] sm:text-[12px]">
              <ActivityIcon
                type={item.type}
                className="h-[10px] w-[10px] shrink-0 text-[#585F6A]"
              />
              <span className="truncate">{item.title}</span>
            </div>

            <p className="mt-[7px] line-clamp-2 break-words text-[14px] font-medium leading-[20px] tracking-[-0.02em] text-[#111827] sm:truncate">
              {item.description}
            </p>
          </div>
        </div>

        <ActivityField
          icon={
            <Store
              className="h-[12px] w-[12px] shrink-0 text-[#667085]"
              strokeWidth={2.2}
            />
          }
          label="MAIN STORE"
          value={<span className="block truncate">{item.store}</span>}
        />

        <ActivityField
          icon={
            <UsersRound
              className="h-[12px] w-[12px] shrink-0 text-[#667085]"
              strokeWidth={2.2}
            />
          }
          label="HANDLED BY"
          value={<span className="block truncate">{item.handledBy}</span>}
        />

        <ActivityField
          icon={
            <Clock3
              className="h-[12px] w-[12px] shrink-0 text-[#667085]"
              strokeWidth={2.2}
            />
          }
          label="DATE & TIME"
          value={
            <div className="flex flex-wrap items-center gap-x-[12px] gap-y-1">
              <span>{item.time}</span>
              <span>{item.date}</span>
            </div>
          }
        />
      </div>
    </article>
  );
});

function ActivitySkeleton() {
  return (
    <div className="space-y-4 xl:space-y-[19px]">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="h-[150px] animate-pulse rounded-[20px] border border-[#C6D8FF] bg-white sm:h-[126px] sm:rounded-[24px] xl:h-[95px]"
        />
      ))}
    </div>
  );
}
type DropdownOption = {
  value: string;
  label: string;
};

function ERPDropdown({
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
}: {
  value: string;
  options: DropdownOption[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const selected =
    options.find((item) => item.value === value) ??
    {
      value: "",
      label: placeholder,
    };

  return (
    <Listbox
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <div className="relative w-full">
        <Listbox.Button
          className={cn(
            "group relative h-[52px] w-full rounded-2xl",
            "border border-[#D9E2F2]",
            "px-5 pr-12 text-left transition-all duration-200",

            disabled
              ? "cursor-not-allowed bg-[#F8FAFC] text-[#94A3B8]"
              : "bg-white hover:border-[#B4C7F7] focus:border-[#2F6FED] focus:ring-4 focus:ring-[#2F6FED]/10"
          )}
        >
          <span className="block truncate text-[15px] font-medium text-[#1A2233]">
            {selected.label}
          </span>

          <ChevronDown
            className={cn(
              "absolute right-4 top-1/2 h-5 w-5",
              "-translate-y-1/2",
              "text-[#64748B]",
              "transition-transform duration-200",
              "group-data-[headlessui-state=open]:rotate-180"
            )}
          />
        </Listbox.Button>
        {!disabled && (<Transition
          as={Fragment}
          leave="transition duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={cn(
              "absolute z-50 mt-2",
              "max-h-72 w-full overflow-auto",
              "rounded-2xl",
              "border border-[#DCE5F5]",
              "bg-white",
              "py-2",
              "shadow-[0_20px_50px_rgba(15,23,42,.14)]",
              "focus:outline-none"
            )}
          >
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                value={option.value}
                className={({ active }) =>
                  cn(
                    "relative cursor-pointer select-none",
                    "px-5 py-3",
                    "text-[14px]",
                    "transition-colors",
                    active
                      ? "bg-[#EEF4FF] text-[#1456C8]"
                      : "text-[#1E293B]"
                  )
                }
              >
                {({ selected }) => (
                  <>
                    <span
                      className={cn(
                        "block truncate",
                        selected
                          ? "font-semibold"
                          : "font-medium"
                      )}
                    >
                      {option.label}
                    </span>

                    {selected && (
                      <Check
                        className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1456C8]"
                      />
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>)}

      </div>
    </Listbox>
  );
}

export default function RecentActivitiesPage() {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();
  const isHeadOffice = useMemo(() => isHeadOfficeUser(), []);

  const [activities, setActivities] = useState<DistrictActivity[]>([]);
  const [retailStores, setRetailStores] = useState<Organization[]>([]);
  const [districtStores, setDistrictStores] = useState<Organization[]>([]);

  const [selectedRetailStore, setSelectedRetailStore] = useState("");
  const [selectedDistrictStore, setSelectedDistrictStore] = useState("");

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [totalCount, setTotalCount] = useState(0);


  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const debouncedSearch = useDebouncedValue(search.trim().toLowerCase(), 300);

  const normalizedActivities = useMemo(
    () => activities.map(normalizeActivity),
    [activities]
  );

  const filteredActivities = normalizedActivities;
  const rowVirtualizer = useVirtualizer({
    count: isMobile ? 0 : filteredActivities.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT,
    overscan: 8,
  });

  const fetchActivities = useCallback(
    async (
      pageNumber = 1,
      isRefresh = false,
      append = false
    ) => {
      try {
        setError("");

        if (append) {
          setLoadingMore(true);
        } else if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        let selectedStore = "";

        if (selectedRetailStore) {
          selectedStore = selectedRetailStore;
        } else if (selectedDistrictStore) {
          selectedStore = selectedDistrictStore;
        }

        const response = selectedStore
          ? await getStoreWiseActivities(
            selectedStore,
            pageNumber,
            PAGE_SIZE,
            debouncedSearch
          )
          : await getOwnRecentActivities(
            pageNumber,
            PAGE_SIZE,
            debouncedSearch
          )

        if (!response.success) {
          throw new Error(response.message);
        }

        const rows = Array.isArray(response.data)
          ? response.data
          : [];

        setActivities((prev) =>
          append ? [...prev, ...rows] : rows
        );

        setTotalCount(response.count || 0);

        setHasMore(
          pageNumber * PAGE_SIZE < (response.count || 0)
        );

        setPage(pageNumber);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load activities"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [selectedRetailStore, selectedDistrictStore]
  );

  useEffect(() => {
    setPage(1);
    setActivities([]);
    fetchActivities(1);
  }, [
    fetchActivities,
    selectedRetailStore,
    selectedDistrictStore,
    debouncedSearch
  ]);
  useEffect(() => {
    async function loadStores() {
      try {
        const [retail, district] = await Promise.all([
          getOrganizationsByLevel("retail"),
          getOrganizationsByLevel("district"),
        ]);

        setRetailStores(retail);
        setDistrictStores(district);
      } catch (err) {
        console.error("Unable to load stores", err);
      }
    }

    loadStores();
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;

    fetchActivities(page + 1, false, true);
  }, [
    page,
    hasMore,
    loadingMore,
    fetchActivities,
  ]);

  console.log(hasMore)
  const selectedDistrict = useMemo(
    () =>
      districtStores.find(
        (store) => store.store_code === selectedDistrictStore
      ),
    [districtStores, selectedDistrictStore]
  );

  const filteredRetailStores = useMemo(() => {
    if (!selectedDistrict) return [];

    return retailStores.filter(
      (store) =>
        String(store.district_id) === String(selectedDistrict.id)
    );
  }, [retailStores, selectedDistrict]);

  const retailOptions = useMemo(
    () => [
      {
        value: "",
        label: "All Retail Stores",
      },
      ...filteredRetailStores.map((store) => ({
        value: store.store_code,
        label: store.store_name,
      })),
    ],
    [filteredRetailStores]
  );
  const districtOptions = useMemo(
    () => [
      {
        value: "",
        label: "All District Stores",
      },
      ...districtStores.map((store) => ({
        value: store.store_code,
        label: store.store_name,
      })),
    ],
    [districtStores]
  );


  return (
    <main className="min-w-0 flex-1 bg-erp-page font-erp">
      <section className="w-full">
        <div className="flex items-start justify-between gap-4 max-md:flex-col">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold leading-[34px] tracking-[-0.04em] text-erp-heading sm:text-[34px] sm:leading-[42px]">
              Recent Activities Performed
            </h1>

            <p className="mt-[6px] max-w-[760px] text-[14px] font-normal leading-[20px] tracking-[-0.02em] text-erp-muted sm:text-[18px] sm:leading-[24px]">
              All updates regarding recent entries, updates, login and logout
            </p>
          </div>
        </div>

        <div className="mt-[22px] flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
          <div className="relative h-[44px] w-full max-w-[420px] max-md:max-w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-erp-muted" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search activity, store, handled by..."
              className="h-full w-full rounded-erp-sm border border-erp-border bg-white pl-11 pr-10 text-[14px] font-medium text-erp-text outline-none transition placeholder:text-erp-placeholder focus:border-erp-primary focus:ring-2 focus:ring-erp-primary/10"
            />

            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full hover:bg-erp-border-soft"
              >
                <X className="h-4 w-4 text-erp-muted" />
              </button>
            ) : null}
          </div>
          {isHeadOffice && (
            <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">

              <div className="w-full lg:w-[320px]">
                <ERPDropdown
                  value={selectedDistrictStore}
                  options={districtOptions}
                  placeholder="Select District"
                  onChange={(value) => {
                    setSelectedDistrictStore(value);
                    setSelectedRetailStore("");
                  }}
                />
              </div>

              <div className="w-full lg:w-[320px]">
                <ERPDropdown
                  value={selectedRetailStore}
                  options={retailOptions}
                  placeholder={
                    selectedDistrictStore
                      ? "Select Retail Store"
                      : "Select District First"
                  }
                  disabled={
                    !selectedDistrictStore ||
                    filteredRetailStores.length === 0
                  }
                  onChange={setSelectedRetailStore}
                />
              </div>

            </div>
          )}
        </div>

        <div className="mt-[24px]">
          {loading ? (
            <ActivitySkeleton />
          ) : error ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-erp-lg border border-erp-danger-soft bg-white px-6 text-center">
              <AlertCircle className="h-9 w-9 text-erp-danger" />
              <h2 className="mt-4 text-[18px] font-semibold text-erp-heading">
                Unable to load activities
              </h2>
              <p className="mt-2 text-[14px] text-erp-muted">{error}</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-erp-lg border border-erp-border bg-white px-6 text-center">
              <Gem className="h-9 w-9 text-erp-primary" />
              <h2 className="mt-4 text-[18px] font-semibold text-erp-heading">
                No recent activities found
              </h2>
              <p className="mt-2 text-[14px] text-erp-muted">
                Try searching with another keyword.
              </p>
            </div>
          ) : isMobile ? (
            <div className="space-y-4">
              {filteredActivities.map((item) => (
                <ActivityCard key={item.id} item={item} />
              ))}

              {hasMore ? (
                <button
                  type="button"
                  onClick={loadMore}


                  className="flex h-[44px] w-full items-center justify-center rounded-erp-sm bg-erp-primary text-[14px] font-semibold text-white"
                >
                  Load More
                </button>
              ) : (
                <div className="flex h-[44px] items-center justify-center text-[13px] font-medium text-erp-muted">
                  No more activities
                </div>
              )}
            </div>
          ) : (
            <div
              ref={parentRef}
              className="dashboard-hidden-scroll h-[calc(100vh-250px)] min-h-[480px] overflow-y-auto pr-1"
            >
              <div
                className="relative w-full"
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const item = filteredActivities[virtualRow.index];

                  if (!item) return null;

                  return (
                    <div
                      key={item.id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className="absolute left-0 top-0 w-full pb-[19px]"
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <ActivityCard item={item} />
                    </div>
                  );
                })}
              </div>

              {hasMore ? (
                <div className="flex h-[58px] items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin text-erp-primary" />
                </div>
              ) : (
                <div className="flex h-[50px] items-center justify-center text-[13px] font-medium text-erp-muted">
                  No more activities
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}