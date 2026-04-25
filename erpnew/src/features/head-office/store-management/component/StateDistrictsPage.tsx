import BackTitleRow from "./BackTitleRow";
import SearchFilterBar from "./SearchFilterBar";
import StoreCardGrid from "./StoreCardGrid";
import {
  getDistrictsByStateId,
  getStateById,
} from "../store-management-data";

type Props = {
  stateId: string;
};

export default function StateDistrictsPage({ stateId }: Props) {
  const state = getStateById(stateId);
  const districtRows = getDistrictsByStateId(stateId);

  return (
    <main className="min-h-screen w-full bg-[#F3F4F6] p-3 sm:p-4 lg:p-5">
      <BackTitleRow title={state?.name || "State"} />

      <SearchFilterBar />

      <div className="mt-6">
        <p className="text-[16px] text-[#475569] sm:text-[18px]">
          Store Management / {state?.name || "State"}
        </p>
      </div>

      <div className="mt-5">
        <StoreCardGrid
          items={districtRows}
          hrefBuilder={(item) => `/head-office/store-management/${stateId}/${item.id}`}
        />
      </div>
    </main>
  );
}