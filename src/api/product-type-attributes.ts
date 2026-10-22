import { API_URL } from "../providers/constants";

export function productTypeAttributeUrl(productTypeId: string, attributeId: string) {
  return `${API_URL}/product_type_attributes/${productTypeId}/${attributeId}`;
}
