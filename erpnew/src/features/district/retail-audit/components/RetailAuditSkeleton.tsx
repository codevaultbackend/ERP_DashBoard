"use client";

export default function RetailAuditSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-[#E5E7EB]
        bg-white
        shadow-sm
      "
    >
      {/* Header */}

      <div className="animate-pulse p-5">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div
              className="
                h-[60px]
                w-[60px]
                rounded-[18px]
                bg-[#EEF2F7]
              "
            />

            <div>
              <div
                className="
                  h-4
                  w-[180px]
                  rounded-md
                  bg-[#EEF2F7]
                "
              />

              <div
                className="
                  mt-3
                  h-3
                  w-[120px]
                  rounded-md
                  bg-[#EEF2F7]
                "
              />

              <div
                className="
                  mt-3
                  h-3
                  w-[90px]
                  rounded-md
                  bg-[#EEF2F7]
                "
              />
            </div>
          </div>

          <div
            className="
              h-[28px]
              w-[80px]
              rounded-full
              bg-[#EEF2F7]
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
          px-5
          py-4
        "
      >
        <div
          className="
            h-[40px]
            w-[110px]
            rounded-[14px]
            bg-[#EEF2F7]
          "
        />

        <div
          className="
            h-[42px]
            w-[42px]
            rounded-full
            bg-[#EEF2F7]
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
        gap-6
        md:grid-cols-2
        xl:grid-cols-3
      "
    >
      {Array.from({
        length: 9,
      }).map((_, index) => (
        <RetailAuditSkeleton
          key={index}
        />
      ))}
    </div>
  );
}