import DistrictStoresPage from "@/features/head-office/store-management/component/DistrictStoresPage";

type PageProps = {
  params: {
    districtId: string;
  };
};

export default function Page({ params }: PageProps) {
  return <DistrictStoresPage districtId={params.districtId} />;
}