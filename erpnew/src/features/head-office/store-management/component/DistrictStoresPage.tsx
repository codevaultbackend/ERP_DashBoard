import { notFound } from "next/navigation";
import BackTitleRow from "./BackTitleRow";
import SearchFilterBar from "./SearchFilterBar";
import StoreCardGrid from "./StoreCardGrid";
import ToggleTabs from "./ToggleTabs";
import {
  getDistrictById,
  getStoresByDistrictId,
} from "../store-management-data";

type Props = {
  districtId: string;
};

export default function DistrictStoresPage({ districtId }: Props) {
  const district = getDistrictById(districtId);

  if (!district) {
    notFound();
  }

  const stores = getStoresByDistrictId(districtId);

  const storeCards = stores.map((store) => ({
    id: store.id,
    name: store.name,
    code: store.code,
  }));

  return (
    <main className="min-h-screen w-full bg-[#F3F4F6] p-3 sm:p-4 lg:p-5">
      <BackTitleRow title="Store Management" />

      <SearchFilterBar withCategory />

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="text-[16px] text-[#475569] sm:text-[18px]">
          Main Warehouse / {district.name} / Store Management
        </p>

        <ToggleTabs
          scope="district"
          districtId={districtId}
          active="stores"
        />
      </div>

      <div className="mt-5">
        <StoreCardGrid
          scope="store"
          districtId={districtId}
          items={storeCards}
        />
      </div>
    </main>
  );
}