"use client";

export default function RetailAuditSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        sm:rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        shadow-sm
      "
    >
      {/* Header */}

      <div className="animate-pulse p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 gap-3 sm:gap-4">
            <div
              className="
                h-[52px]
                w-[52px]
                shrink-0
                rounded-2xl
                bg-[#EEF2F7]
                sm:h-[60px]
                sm:w-[60px]
                sm:rounded-[18px]
              "
            />

            <div className="min-w-0 flex-1">
              <div
                className="
                  h-4
                  w-full
                  max-w-[180px]
                  rounded-md
                  bg-[#EEF2F7]
                "
              />

              <div
                className="
                  mt-3
                  h-3
                  w-full
                  max-w-[120px]
                  rounded-md
                  bg-[#EEF2F7]
                "
              />

              <div
                className="
                  mt-3
                  h-3
                  w-full
                  max-w-[90px]
                  rounded-md
                  bg-[#EEF2F7]
                "
              />
            </div>
          </div>

          <div
            className="
              h-7
              w-16
              shrink-0
              rounded-full
              bg-[#EEF2F7]
              sm:h-[28px]
              sm:w-[80px]
            "
          />
        </div>
      </div>

      {/* Footer */}

      <div
        className="
          flex
          items-center
          justify-between
          border-t
          border-[#F1F5F9]
          px-4
          py-4
          sm:px-5
        "
      >
        <div
          className="
            h-10
            w-[90px]
            rounded-xl
            bg-[#EEF2F7]
            sm:w-[110px]
            sm:rounded-[14px]
          "
        />

        <div
          className="
            h-10
            w-10
            rounded-full
            bg-[#EEF2F7]
            sm:h-[42px]
            sm:w-[42px]
          "
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               GRID SKELETON                                */
/* -------------------------------------------------------------------------- */

export function RetailAuditSkeletonGrid() {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-4
        sm:gap-5
        lg:grid-cols-2
        xl:grid-cols-2
        2xl:grid-cols-3
      "
    >
      {Array.from({ length: 9 }).map(
        (_, index) => (
          <RetailAuditSkeleton
            key={index}
          />
        )
      )}
    </div>
  );
}