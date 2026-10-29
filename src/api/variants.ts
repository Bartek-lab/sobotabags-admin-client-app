import { API_URL } from "../providers/constants";

export type VariantAttributeValue = { attribute_id: string; code: string; data_type: string; value: unknown };
export type Variant = {
  id: string;
  sku: string;
  is_active: boolean;
  quantity_on_hand: number;
  price_amount: number | null;
  attributes: VariantAttributeValue[];
};

export function variantsListUrl(productId: string) {
  return `${API_URL}/products/${productId}/variants`;
}

export function variantUrl(productId: string, variantId: string) {
  return `${API_URL}/products/${productId}/variants/${variantId}`;
}

export function toVariantPayload(
  values: Record<string, unknown>,
  attributeDefs: { attribute_id: string }[],
) {
  const attributes = attributeDefs
    .map((def) => ({ attribute_id: def.attribute_id, value: values[def.attribute_id] }))
    .filter((a) => a.value !== undefined && a.value !== null && a.value !== "");

  return {
    sku: values.sku,
    is_active: !!values.is_active,
    quantity_on_hand: values.quantity_on_hand ?? 0,
    price_amount:
      values.price !== undefined && values.price !== null
        ? Math.round((values.price as number) * 100)
        : null,
    attributes,
  };
}
