import { useCustom, useCustomMutation, type HttpError } from "@refinedev/core";
import { useEffect, useState } from "react";
import { message } from "antd";
import { productCategoriesUrl, type ProductCategoryValue } from "../api/product-categories";

// Saved through the custom /products/{id}/categories endpoint (see
// app/routers/products.py) -- product_categories is a composite-PK join
// table generic CRUD can't address, and a partial unique index allows at
// most one is_primary row per product, so the save is a full replace rather
// than a per-row create/delete.
export function useProductCategories(productId: string | undefined) {
  const { result, query } = useCustom<ProductCategoryValue[]>({
    url: productCategoriesUrl(productId ?? ""),
    method: "get",
    queryOptions: { enabled: !!productId },
  });
  const { mutate, mutation } = useCustomMutation();

  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [primaryId, setPrimaryId] = useState<string | null>(null);

  useEffect(() => {
    if (!Array.isArray(result?.data)) return;
    setCategoryIds(result.data.map((v) => v.category_id));
    setPrimaryId(result.data.find((v) => v.is_primary)?.category_id ?? null);
    // Depend on result.data (react-query's own memoized array), not result
    // itself -- useCustom wraps it in a brand-new `{ data: ... }` object
    // literal on every render, so depending on `result` made this effect
    // (and its setState calls) fire every single render, an infinite loop
    // confirmed live as a "Maximum update depth exceeded" crash.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.data]);

  const save = () => {
    mutate(
      {
        url: productCategoriesUrl(productId!),
        method: "put",
        values: { category_ids: categoryIds, primary_category_id: primaryId },
        config: { headers: { "Content-Type": "application/json" } },
      },
      {
        onSuccess: () => {
          message.success("Categories saved");
          query.refetch();
        },
        onError: (error: HttpError) => message.error(error.message ?? "Failed to save categories"),
      },
    );
  };

  return { categoryIds, setCategoryIds, primaryId, setPrimaryId, save, saving: mutation.isPending };
}
