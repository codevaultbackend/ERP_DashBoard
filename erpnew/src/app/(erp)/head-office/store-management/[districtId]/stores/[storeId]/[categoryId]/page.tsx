import CategoryArticlesPage from "@/features/head-office/store-management/component/CategoryArticlesPage";

type PageProps = {
  params: {
    districtId: string;
    storeId: string;
    categoryId: string;
  };
};

export default function Page({ params }: PageProps) {
  return (
    <CategoryArticlesPage
      scope="store"
      districtId={params.districtId}
      storeId={params.storeId}
      categoryId={params.categoryId}
    />
  );
}