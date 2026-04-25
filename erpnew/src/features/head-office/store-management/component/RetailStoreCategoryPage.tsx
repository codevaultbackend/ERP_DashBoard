import { notFound } from "next/navigation";
import BackTitleRow from "./BackTitleRow";
import CategoryTable from "./CategoryTable";
import SearchFilterBar from "./SearchFilterBar";
import ToggleTabs from "./ToggleTabs";
import {
  getDistrictById,
  getRetailStoreByDistrictAndStoreId,
  getRetailStoreCategories,
} from "../store-management-data";

type Props = {
  districtId: string;
  storeId: string;
};

export default function RetailStoreCategoryPage({
  districtId,
  storeId,
}: Props) {
  const district = getDistrictById(districtId);
  const store = getRetailStoreByDistrictAndStoreId(districtId, storeId);

  if (!district || !store) {
    notFound();
  }

  const categories = getRetailStoreCategories(storeId);

  return (
    <main className="min-h-screen w-full bg-[#F3F4F6] p-3 sm:p-4 lg:p-5">
      <BackTitleRow title="Store Management" />
      <SearchFilterBar withCategory />

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="text-[16px] text-[#475569] sm:text-[18px]">
          Main Warehouse / {district.name} / {store.name}
        </p>

        <ToggleTabs
          scope="store"
          districtId={districtId}
          storeId={storeId}
          active="stores"
        />
      </div>

      <div className="mt-5">
        <CategoryTable
          rows={categories}
          scope="store"
          districtId={districtId}
          storeId={storeId}
        />
      </div>
    </main>
  );
}