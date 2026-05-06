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
    <main className="min-h-screen bg-erp-bg text-erp-text">
      <section className="mx-auto w-full max-w-[1500px]">
        <BackTitleRow title={getCategoryName(props.categoryId)} />

        <SearchFilterBar withCategory placeholder="Search article..." />

        <div className="mt-6">
          <ArticleTable rows={rows} />
        </div>
      </section>
    </main>
  );
}