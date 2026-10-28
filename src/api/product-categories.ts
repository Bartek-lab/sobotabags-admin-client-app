import { API_URL } from "../providers/constants";

export type ProductCategoryValue = {
  category_id: string;
  code: string;
  is_primary: boolean;
  sort_order: number;
};

export function productCategoriesUrl(productId: string) {
  return `${API_URL}/products/${productId}/categories`;
}
