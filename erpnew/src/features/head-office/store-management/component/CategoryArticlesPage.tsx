import { notFound } from "next/navigation";
import ArticleTable from "./ArticleTable";
import BackTitleRow from "./BackTitleRow";
import SearchFilterBar from "./SearchFilterBar";
import {
  getArticlesByCategory,
  getCategoryById,
  getCategoryName,
  getDistrictById,
  getRetailStoreByDistrictAndStoreId,
} from "../store-management-data";

type Props =
  | {
      scope: "district";
      districtId: string;
      categoryId: string;
    }
  | {
      scope: "store";
      districtId: string;
      storeId: string;
      categoryId: string;
    };

export default function CategoryArticlesPage(props: Props) {
  const district = getDistrictById(props.districtId);
  const category = getCategoryById(props.categoryId);

  if (!district || !category) {
    notFound();
  }

  if (props.scope === "store") {
    const store = getRetailStoreByDistrictAndStoreId(
      props.districtId,
      props.storeId
    );

    if (!store) {
      notFound();
    }
  }

  const rows = getArticlesByCategory(props.categoryId);

  return (
    <main className="min-h-screen w-full bg-[#F3F4F6] p-3 sm:p-4 lg:p-5">
      <BackTitleRow title={getCategoryName(props.categoryId)} />
      <SearchFilterBar />

      <div className="mt-6">
        <ArticleTable rows={rows} />
      </div>
    </main>
  );
}