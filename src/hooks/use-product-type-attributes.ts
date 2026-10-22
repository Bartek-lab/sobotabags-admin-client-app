import { useCustomMutation } from "@refinedev/core";
import { productTypeAttributeUrl } from "../api/product-type-attributes";

// Only the removal goes through a dedicated endpoint: the composite-PK
// (product_type_id, attribute_id) row can't be addressed by generic CRUD's
// single-id delete. Creation still uses Refine's generic useCreate -- that
// one's a plain single-row insert, no composite key involved.
export function useRemoveProductTypeAttribute(productTypeId: string | undefined, onRemoved: () => void) {
  const { mutate } = useCustomMutation();

  return (attributeId: string) => {
    mutate(
      { url: productTypeAttributeUrl(productTypeId!, attributeId), method: "delete", values: {} },
      { onSuccess: onRemoved },
    );
  };
}
