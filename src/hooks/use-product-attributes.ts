import { useCustom, useCustomMutation, type HttpError } from "@refinedev/core";
import { useEffect } from "react";
import { message, type FormInstance } from "antd";
import dayjs from "dayjs";
import { productAttributesUrl, type ProductAttributeValue } from "../api/product-attributes";

type ProductAttributeDef = { attribute_id: string; attribute?: { data_type: string } };

// product-level, non-translatable attributes for a product's type -- saved
// through the custom /products/{id}/attributes endpoint (see
// app/routers/products.py) because the underlying table has a composite
// key generic CRUD can't address.
export function useProductAttributes(productId: string | undefined, form: FormInstance) {
  const { result, query } = useCustom<ProductAttributeValue[]>({
    url: productAttributesUrl(productId ?? ""),
    method: "get",
    queryOptions: { enabled: !!productId },
  });
  const { mutate, mutation } = useCustomMutation();

  useEffect(() => {
    if (!Array.isArray(result?.data)) return;
    const initial: Record<string, unknown> = {};
    for (const v of result.data) {
      initial[v.attribute_id] = v.data_type === "date" && v.value ? dayjs(v.value as string) : v.value;
    }
    form.setFieldsValue(initial);
  }, [result, form]);

  const save = (values: Record<string, unknown>, productAttributes: ProductAttributeDef[]) => {
    const payload = productAttributes
      .filter((ta) => values[ta.attribute_id] !== undefined && values[ta.attribute_id] !== null)
      .map((ta) => {
        const raw = values[ta.attribute_id];
        const value =
          ta.attribute?.data_type === "date" && raw ? (raw as dayjs.Dayjs).format("YYYY-MM-DD") : raw;
        return { attribute_id: ta.attribute_id, value };
      });
    mutate(
      {
        url: productAttributesUrl(productId!),
        method: "put",
        values: payload,
        config: { headers: { "Content-Type": "application/json" } },
      },
      {
        onSuccess: () => {
          message.success("Attributes saved");
          query.refetch();
        },
        onError: (error: HttpError) => message.error(error.message ?? "Failed to save attributes"),
      },
    );
  };

  return { save, saving: mutation.isPending };
}
