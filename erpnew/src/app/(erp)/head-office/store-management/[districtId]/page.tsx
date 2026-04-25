import DistrictCategoryPage from "@/features/head-office/store-management/component/DistrictCategoryPage";

type PageProps = {
  params: {
    districtId: string;
  };
};

export default function Page({ params }: PageProps) {
  return <DistrictCategoryPage districtId={params.districtId} />;
}