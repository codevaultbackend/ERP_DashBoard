import { notFound } from "next/navigation";
import BackTitleRow from "./BackTitleRow";
import CategoryTable from "./CategoryTable";
import ToggleTabs from "./ToggleTabs";
import { defaultCategories, getDistrictById } from "../store-management-data";

type Props = {
  districtId: string;
};

export default function DistrictCategoryPage({ districtId }: Props) {
  const district = getDistrictById(districtId);

  if (!district) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-erp-bg text-erp-text">
      <section className="mx-auto w-full max-w-[1500px]">
        <BackTitleRow title={district.name} />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[16px] font-medium text-erp-muted sm:text-[18px]">
            Main Warehouse / {district.name}
          </p>

          <ToggleTabs
            scope="district"
            districtId={districtId}
            active="districts"
          />
        </div>

        <div className="mt-6">
          <CategoryTable
            rows={defaultCategories}
            scope="district"
            districtId={districtId}
          />
        </div>
      </section>
    </main>
  );
}