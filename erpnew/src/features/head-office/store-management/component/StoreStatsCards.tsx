import { storeStats } from "../store-management-data";

export default function StoreStatsCards() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {storeStats.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-[28px] border border-[#E5E7EB] bg-white px-5 py-5 shadow-[0px_4px_14px_rgba(15,23,42,0.035)]"
          >
            <div
              className={[
                "flex h-[52px] w-[52px] items-center justify-center rounded-[18px]",
                card.iconWrap,
              ].join(" ")}
            >
              <Icon className={["h-6 w-6", card.iconColor].join(" ")} />
            </div>

            <div className="mt-6 flex items-end justify-between gap-3">
              <div>
                <p className="text-[16px] font-medium text-[#4B5563]">
                  {card.title}
                </p>
                <h3 className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-[#111827]">
                  {card.value}
                </h3>
              </div>

              {card.change ? (
                <p className={`text-[16px] font-semibold ${card.changeColor}`}>
                  {card.change}
                </p>
              ) : null}
            </div>
          </div>
        );
      })}
    </section>
  );
}