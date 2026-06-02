"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ArrowLeft, ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import DestinationCard from "../../../../../features/head-office/Tracking-management/DestinationCard";
import BatchCalendarModal from "../../../../../features/head-office/Tracking-management/BatchCalendarModal";
import { useItemBatchesByDate }
  from "@/features/head-office/Tracking-management/hook/useItemBatchesByDate";

import { useBatchTracking } from "@/features/head-office/Tracking-management/hook/useBatchTracking";
import { useItemBatches } from "@/features/head-office/Tracking-management/hook/useItemBatches";

export default function Tracking() {
  const router = useRouter();

  const params =
    useParams<{ itemId: string }>();

  const itemId = useMemo(() => {
    const parsed = Number(
      params?.itemId
    );

    return Number.isFinite(parsed)
      ? parsed
      : undefined;
  }, [params?.itemId]);

  const [search, setSearch] =
    useState("");

  const [calendarOpen, setCalendarOpen] =
    useState(false);

  const [selectedDate, setSelectedDate] =
    useState<Date | null>(null);

  const [
    selectedBatchId,
    setSelectedBatchId,
  ] = useState<number>();

  const [
    expandedCard,
    setExpandedCard,
  ] = useState<string | null>(
    null
  );

  const fetchBatchByDate = async (
    date: string
  ) => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/item-tracker/items/${itemId}/batches-by-date?date=${date}`,
          {
            headers: {
              ...(token
                ? {
                  Authorization: `Bearer ${token}`,
                }
                : {}),
            },
          }
        );

      const result =
        await response.json();

      return result.data || [];
    } catch (error) {
      console.error(error);

      return [];
    }
  };

  const {
    batches,
    loading: batchesLoading,
    error: batchesError,
  } = useItemBatches(itemId);

  const {
    fetchByDate,
  } = useItemBatchesByDate();

  /**
   * Auto select first batch
   */
  useEffect(() => {
    if (
      batches.length > 0 &&
      !selectedBatchId
    ) {
      setSelectedBatchId(
        batches[0].batch_id
      );

      setSelectedDate(
        new Date(
          batches[0].created_at
        )
      );
    }
  }, [
    batches,
    selectedBatchId,
  ]);

  const {
    data,
    loading,
    error,
  } = useBatchTracking(
    selectedBatchId
  );

  /**
   * Final destinations from backend
   */
  const destinations =
    useMemo(() => {
      return (
        data?.final_destinations ??
        []
      );
    }, [data]);

  /**
   * Auto expand first card
   */
  useEffect(() => {
    if (
      destinations.length > 0
    ) {
      setExpandedCard(
        `${destinations[0].organization_id}-${destinations[0].store_code}`
      );
    }
  }, [
    selectedBatchId,
    destinations,
  ]);

  const filteredData =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query)
        return destinations;

      return destinations.filter(
        (destination) =>
          destination.store_name
            ?.toLowerCase()
            .includes(query) ||
          destination.store_code
            ?.toLowerCase()
            .includes(query) ||
          destination.organization_level
            ?.toLowerCase()
            .includes(query)
      );
    }, [
      destinations,
      search,
    ]);

  console.log("batches", batches);
  console.log(
    "availableDates",
    batches.map(
      (batch) => batch.created_at
    )
  );

  if (
    loading ||
    batchesLoading
  ) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">
            Loading tracking data...
          </div>
        </div>
      </div>
    );
  }

  if (
    error ||
    batchesError
  ) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-600">
          {error ||
            batchesError}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <button
            onClick={() =>
              router.back()
            }
            className="
              h-12
              w-12
              rounded-[18px]
              border
              border-[#ECECEC]
              bg-white
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <ChevronLeft size={24} />

          </button>

          <h1
            className="
              text-[28px]
              font-semibold
              text-[#101828]
              leading-[36px]
              tracking-[0.4px]
            "
          >
            Track Item #
            {itemId}
          </h1>
        </div>

        {/* Search */}

        <div
          className="
            bg-white
            rounded-[34px]
            border-[1px]
                border-[#0000001A]
            p-4
            flex
            flex-col
            lg:flex-row
            gap-4
          "
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-[#717182]
                text-[14px]
                font-[400]
              "
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search destination..."
              className="
                w-full
                h-12
                rounded-[32px]
                border-[1px]
                border-[#00000000]
                bg-[#F7F7F7]
                pl-11
                pr-4
                outline-none
              "
            />
          </div>

          <button
            onClick={() =>
              setCalendarOpen(true)
            }
            className="
              h-12
              px-7
              rounded-full
              bg-[#0F172A]
              text-white
              whitespace-nowrap
            "
          >
            Select Batch
          </button>
        </div>

        <div>
          <h2
            className="
              text-[24px]
              font-semibold
              text-[#101828]
              leading-[36px]
              tracking-[0.4px]
              mb-4
            "
          >
            Final Destinations
          </h2>

          {filteredData.length === 0 ? (
            <div
              className="
      py-20
      rounded-[24px]
      border
      border-[#ECECEC]
      bg-white
      flex
      items-center
      justify-center
      text-[#667085]
    "
            >
              No destinations found
            </div>
          ) : (
            <div
              className="
      grid
      grid-cols-1
      xl:grid-cols-[420px_1fr]
      gap-6
      items-start
    "
            >
              {/* Expanded Card */}

              <div className="xl:sticky xl:top-4">
                {filteredData
                  .filter(
                    (destination) =>
                      expandedCard ===
                      `${destination.organization_id}-${destination.store_code}`
                  )
                  .map((destination) => {
                    const cardKey =
                      `${destination.organization_id}-${destination.store_code}`;

                    const destinationMovements =
                      (data?.movement_history ?? []).filter(
                        (movement) =>
                          movement.to_store_code === destination.store_code ||
                          movement.from_store_code === destination.store_code
                      );

                    return (
                      <DestinationCard
                        key={cardKey}
                        destination={destination}
                        movementHistory={destinationMovements}
                        expanded={true}
                        onToggle={() =>
                          setExpandedCard(null)
                        }
                      />
                    );
                  })}
              </div>

              {/* Remaining Cards */}

              <div
                className="
        grid
        grid-cols-1
        md:grid-cols-2
        gap-5
      "
              >
                {filteredData
                  .filter(
                    (destination) =>
                      expandedCard !==
                      `${destination.organization_id}-${destination.store_code}`
                  )
                  .map((destination) => {
                    const cardKey =
                      `${destination.organization_id}-${destination.store_code}`;

                    const destinationMovements =
                      (data?.movement_history ?? []).filter(
                        (movement) =>
                          movement.to_store_code === destination.store_code ||
                          movement.from_store_code === destination.store_code
                      );

                    return (
                      <DestinationCard
                        key={cardKey}
                        destination={destination}
                        movementHistory={destinationMovements}
                        expanded={false}
                        onToggle={() =>
                          setExpandedCard(cardKey)
                        }
                      />
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      <BatchCalendarModal
        open={calendarOpen}
        onClose={() =>
          setCalendarOpen(false)
        }
        availableDates={batches.map(
          (batch) =>
            batch.created_at
        )}
        onSelectDate={async (
          dateString
        ) => {
          const filteredBatches =
            await fetchBatchByDate(
              dateString
            );

          setSelectedDate(
            new Date(dateString)
          );

          if (
            filteredBatches.length > 0
          ) {
            setSelectedBatchId(
              filteredBatches[0].batch_id
            );
          }

          setCalendarOpen(false);
        }}
      />
    </>
  );
}