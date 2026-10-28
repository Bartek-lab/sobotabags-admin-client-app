import { API_URL } from "../providers/constants";

export type CategoryWithName = {
  id: string;
  parent_id: string | null;
  code: string;
  is_active: boolean | null;
  sort_order: number | null;
  // null when this category has no translation yet -- also means it's
  // currently invisible on the storefront (shop-api's listing requires one).
  name: string | null;
};

export function categoriesWithNamesUrl() {
  return `${API_URL}/categories/with-names`;
}
