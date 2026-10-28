import { useCustom, useCustomMutation, type HttpError } from "@refinedev/core";
import { message } from "antd";
import { toVariantPayload, variantUrl, variantsListUrl, type Variant } from "../api/variants";

// Same reasoning as useProductMedia/useTranslations: a variant's price and
// axis/scalar attribute values live in composite-PK tables generic CRUD
// can't address, so this goes through the dedicated endpoint
// (app/routers/variants.py) instead of useCreate/useUpdate.
export function useVariants(productId: string | undefined, attributeDefs: { attribute_id: string }[]) {
  const { result, query } = useCustom<Variant[]>({
    url: productId ? variantsListUrl(productId) : "",
    method: "get",
    queryOptions: { enabled: !!productId },
  });
  const variants = Array.isArray(result?.data) ? result.data : [];

  const { mutate: createVariant, mutation: createMutation } = useCustomMutation();
  const { mutate: updateVariant, mutation: updateMutation } = useCustomMutation();
  const { mutate: deleteVariant } = useCustomMutation();

  const config = { headers: { "Content-Type": "application/json" } };

  const save = (values: Record<string, unknown>, editingId: string | undefined, onSuccess: () => void) => {
    const body = toVariantPayload(values, attributeDefs);
    const onError = (error: HttpError) => message.error(error.message ?? "Failed to save variant");
    const handleSuccess = () => {
      message.success(editingId ? "Variant updated" : "Variant created");
      onSuccess();
      query.refetch();
    };

    if (editingId) {
      updateVariant(
        { url: variantUrl(productId!, editingId), method: "put", values: body, config },
        { onSuccess: handleSuccess, onError },
      );
    } else {
      createVariant(
        { url: variantsListUrl(productId!), method: "post", values: body, config },
        { onSuccess: handleSuccess, onError },
      );
    }
  };

  const remove = (variantId: string) => {
    deleteVariant(
      { url: variantUrl(productId!, variantId), method: "delete", values: {} },
      {
        onSuccess: () => {
          message.success("Variant deleted");
          query.refetch();
        },
        onError: (error: HttpError) => message.error(error.message ?? "Failed to delete variant"),
      },
    );
  };

  return {
    variants,
    loading: query.isLoading,
    saving: createMutation.isPending || updateMutation.isPending,
    save,
    remove,
  };
}
