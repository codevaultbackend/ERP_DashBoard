import { notFound } from "next/navigation";
import BackTitleRow from "./BackTitleRow";
import CategoryTable from "./CategoryTable";
import SearchFilterBar from "./SearchFilterBar";
import ToggleTabs from "./ToggleTabs";
import {
  getDistrictById,
  getDistrictCategories,
} from "../store-management-data";

type Props = {
  districtId: string;
};

export default function DistrictCategoryPage({ districtId }: Props) {
  const district = getDistrictById(districtId);

  if (!district) {
    notFound();
  }

  const categories = getDistrictCategories(districtId);

  return (
    <main className="min-h-screen w-full bg-[#F3F4F6] p-3 sm:p-4 lg:p-5">
      <BackTitleRow title={district.name} />

      <SearchFilterBar withCategory />

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <p className="text-[16px] text-[#475569] sm:text-[18px]">
          Main Warehouse / {district.name}
        </p>

        <ToggleTabs
          scope="district"
          districtId={districtId}
          active="districts"
        />
      </div>

      <div className="mt-5">
        <CategoryTable
          rows={categories}
          scope="district"
          districtId={districtId}
        />
      </div>
    </main>
  );
}