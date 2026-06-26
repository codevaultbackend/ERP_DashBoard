import { storeStats } from "../store-management-data";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function StoreStatsCards() {
  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {storeStats.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="flex h-[132px] flex-col justify-between rounded-[24px] border border-erp-border bg-erp-card p-4 shadow-erp-card sm:h-[160px] sm:rounded-[28px] sm:p-5"
          >
            <div
              className={cn(
                "flex h-[48px] w-[48px] items-center justify-center rounded-[16px] sm:h-[54px] sm:w-[54px] sm:rounded-[17px]",
                card.iconWrap
              )}
            >
              <Icon className={cn("h-6 w-6 sm:h-7 sm:w-7", card.iconColor)} />
            </div>

            <div>
              <p className="truncate text-[13px] font-medium text-erp-muted sm:text-[15px]">
                {card.title}
              </p>

              <div className="mt-1 flex items-end justify-between gap-2">
                <h3 className="truncate text-[24px] font-[600] leading-[100%] tracking-[-0.04em] text-erp-text sm:text-[28px]">
                  {card.value}
                </h3>

                {card.change ? (
                  <span
                    className={cn(
                      "hidden shrink-0 text-[15px] font-semibold sm:block",
                      card.changeColor
                    )}
                  >
                    {card.change}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}