import StoreCardGrid from "./StoreCardGrid";
import StoreStatsCards from "./StoreStatsCards";
import { districts } from "../store-management-data";

export default function StoreManagementLanding() {
  return (
    <main className="min-h-screen bg-erp-bg text-erp-text">
      <section className="mx-auto w-full max-w-[1500px]">
        <div className="mb-7">
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-erp-text sm:text-[34px]">
            Store Management
          </h1>

          <p className="mt-1 text-[16px] font-medium text-erp-muted">
            Manage all district stores
          </p>
        </div>

        <StoreStatsCards />

        <div className="mt-9">
          <h2 className="text-[24px] font-bold tracking-[-0.03em] text-erp-text sm:text-[28px]">
            All Stores
          </h2>

          <div className="mt-7">
            <StoreCardGrid
              scope="district"
              items={districts}
              emptyText="No district stores found."
            />
          </div>
        </div>
      </section>
    </main>
  );
}