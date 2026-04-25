import StoreCardGrid from "./StoreCardGrid";
import StoreStatsCards from "./StoreStatsCards";
import { districts } from "../store-management-data";

export default function StoreManagementLanding() {
  const districtCards = districts.map((district) => ({
    id: district.id,
    name: district.name,
    code: district.code,
  }));

  return (
    <main className="min-h-screen w-full bg-[#F3F4F6]">
      <div className="mb-7">
        <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-[#111827] sm:text-[46px]">
          Store Management
        </h1>
        <p className="mt-1 text-[16px] text-[#475569] sm:text-[18px]">
          Manage all district stores
        </p>
      </div>

      <StoreStatsCards />

      <div className="mt-8">
        <h2 className="mb-5 text-[26px] font-semibold tracking-[-0.03em] text-[#111827] sm:text-[28px]">
          All Stores
        </h2>

        <StoreCardGrid scope="district" items={districtCards} />
      </div>
    </main>
  );
}