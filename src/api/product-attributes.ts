import { API_URL } from "../providers/constants";

export type ProductAttributeValue = { attribute_id: string; code: string; data_type: string; value: unknown };

export function productAttributesUrl(productId: string) {
  return `${API_URL}/products/${productId}/attributes`;
}
