import { notFound } from "next/navigation";
import BackTitleRow from "./BackTitleRow";
import StoreCardGrid from "./StoreCardGrid";
import ToggleTabs from "./ToggleTabs";
import {
  getDistrictById,
  getRetailStoresByDistrictId,
} from "../store-management-data";

type Props = {
  districtId: string;
};

export default function DistrictStoresPage({ districtId }: Props) {
  const district = getDistrictById(districtId);

  if (!district) {
    notFound();
  }

  const stores = getRetailStoresByDistrictId(districtId);

  return (
    <main className="min-h-screen bg-erp-bg text-erp-text">
      <section className="mx-auto w-full max-w-[1500px]">
        <BackTitleRow title="Store Management" />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[16px] font-medium text-erp-muted sm:text-[18px]">
            Main Warehouse / {district.name} / Store Management
          </p>

          <ToggleTabs
            scope="district"
            districtId={districtId}
            active="stores"
          />
        </div>

        <div className="mt-6">
          <StoreCardGrid
            scope="store"
            districtId={districtId}
            items={stores}
            emptyText="No retail stores found."
          />
        </div>
      </section>
    </main>
  );
}