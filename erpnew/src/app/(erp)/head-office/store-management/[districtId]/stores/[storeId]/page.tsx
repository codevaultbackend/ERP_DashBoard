import RetailStoreCategoryPage from "@/features/head-office/store-management/component/RetailStoreCategoryPage";

type PageProps = {
  params: {
    districtId: string;
    storeId: string;
  };
};

export default function Page({ params }: PageProps) {
  return (
    <RetailStoreCategoryPage
      districtId={params.districtId}
      storeId={params.storeId}
    />
  );
}