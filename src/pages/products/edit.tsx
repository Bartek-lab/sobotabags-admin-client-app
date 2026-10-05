import { Edit, useForm, useSelect } from "@refinedev/antd";
import { useCustom, useCustomMutation, useList } from "@refinedev/core";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
  message,
} from "antd";
import { useEffect, useMemo } from "react";
import dayjs from "dayjs";
import { API_URL } from "../../providers/constants";
import { TranslationsCard } from "../../components/translations-card";
import { ProductMediaCard } from "../../components/product-media";
import { VariantsCard } from "../../components/variants-card";

const { Text } = Typography;

type Attribute = {
  id: string;
  code: string;
  data_type: string;
  is_translatable: boolean | null;
  sort_order: number | null;
};
type AttributeOption = { id: string; attribute_id: string; code: string };
type TypeAttribute = {
  product_type_id: string;
  attribute_id: string;
  level: string;
  is_required: boolean | null;
};
type AttributeValue = { attribute_id: string; code: string; data_type: string; value: unknown };

// This is the screen the whole POC was built to stress-test: a product's
// available fields depend on its product_type, which generic CRUD has no
// way to express -- the form has to be assembled at runtime from
// product_type_attributes + attributes + attribute_options, and saved
// through the custom /products/{id}/attributes endpoint (see
// app/routers/products.py) because the underlying tables have composite
// keys generic CRUD can't address.
export const ProductEdit = () => {
  const { formProps, saveButtonProps, query } = useForm({});
  const product = query?.data?.data as { product_type_id?: string } | undefined;
  const productId = formProps.initialValues?.id as string | undefined;

  const { selectProps: taxClassSelectProps } = useSelect({
    resource: "tax_classes",
    optionLabel: "name",
    optionValue: "id",
  });

  const { result: attributesResult } = useList<Attribute>({
    resource: "attributes",
    pagination: { pageSize: 200 },
  });
  const { result: optionsResult } = useList<AttributeOption>({
    resource: "attribute_options",
    pagination: { pageSize: 500 },
  });
  const { result: typeAttrsResult } = useList<TypeAttribute>({
    resource: "product_type_attributes",
    filters: product?.product_type_id
      ? [{ field: "product_type_id", operator: "eq", value: product.product_type_id }]
      : [],
    queryOptions: { enabled: !!product?.product_type_id },
    pagination: { pageSize: 100 },
  });

  const { result: valuesResult, query: valuesQuery } = useCustom<AttributeValue[]>({
    url: `${API_URL}/products/${productId}/attributes`,
    method: "get",
    queryOptions: { enabled: !!productId },
  });

  const { mutate: saveAttributes, mutation: saveMutation } = useCustomMutation();
  const [attrForm] = Form.useForm();

  // product-level, non-translatable attributes for this product's type --
  // variant-level axes are out of scope for this pass. Translatable text
  // values are excluded too: the backend rejects a translatable attribute in
  // the same PUT transaction as every other value, which would silently
  // fail the WHOLE save if one slipped through here -- this filter has to
  // actually match that rule, not just say so in a comment.
  const productAttributes = useMemo(() => {
    const byId = new Map((attributesResult?.data ?? []).map((a: Attribute) => [a.id, a]));
    return (typeAttrsResult?.data ?? [])
      .filter((ta: TypeAttribute) => ta.level === "product")
      .map((ta: TypeAttribute) => ({ ...ta, attribute: byId.get(ta.attribute_id) }))
      .filter(
        (ta: TypeAttribute & { attribute?: Attribute }) =>
          ta.attribute && !ta.attribute.is_translatable,
      )
      .sort(
        (a: { attribute?: Attribute }, b: { attribute?: Attribute }) =>
          (a.attribute?.sort_order ?? 0) - (b.attribute?.sort_order ?? 0),
      );
  }, [attributesResult, typeAttrsResult]);

  const excludedAttributes = useMemo(() => {
    const byId = new Map((attributesResult?.data ?? []).map((a: Attribute) => [a.id, a]));
    return (typeAttrsResult?.data ?? [])
      .filter((ta: TypeAttribute) => ta.level === "product")
      .map((ta: TypeAttribute) => byId.get(ta.attribute_id))
      .filter((a?: Attribute) => a && a.is_translatable) as Attribute[];
  }, [attributesResult, typeAttrsResult]);

  const optionsByAttribute = useMemo(() => {
    const map = new Map<string, AttributeOption[]>();
    for (const o of optionsResult?.data ?? []) {
      map.set(o.attribute_id, [...(map.get(o.attribute_id) ?? []), o]);
    }
    return map;
  }, [optionsResult]);

  // variant_axis (color/size) + variant (width/height/depth) attributes for
  // this product type -- same translatable exclusion as productAttributes,
  // multiselect isn't meaningful at variant level so there's nothing to
  // exclude there (see app/routers/variants.py).
  const variantAttributes = useMemo(() => {
    const byId = new Map((attributesResult?.data ?? []).map((a: Attribute) => [a.id, a]));
    return (typeAttrsResult?.data ?? [])
      .filter((ta: TypeAttribute) => ta.level === "variant_axis" || ta.level === "variant")
      .map((ta: TypeAttribute) => ({ ...ta, attribute: byId.get(ta.attribute_id) }))
      .filter(
        (ta: TypeAttribute & { attribute?: Attribute }) =>
          ta.attribute && !ta.attribute.is_translatable,
      )
      .sort(
        (a: { attribute?: Attribute }, b: { attribute?: Attribute }) =>
          (a.attribute?.sort_order ?? 0) - (b.attribute?.sort_order ?? 0),
      );
  }, [attributesResult, typeAttrsResult]);

  useEffect(() => {
    if (!Array.isArray(valuesResult?.data)) return;
    const initial: Record<string, unknown> = {};
    for (const v of valuesResult.data) {
      initial[v.attribute_id] = v.data_type === "date" && v.value ? dayjs(v.value as string) : v.value;
    }
    attrForm.setFieldsValue(initial);
  }, [valuesResult, attrForm]);

  type ProductAttribute = TypeAttribute & { attribute?: Attribute };

  const onSaveAttributes = (values: Record<string, unknown>) => {
    const payload = (productAttributes as ProductAttribute[])
      .filter((ta) => values[ta.attribute_id] !== undefined && values[ta.attribute_id] !== null)
      .map((ta) => {
        const raw = values[ta.attribute_id];
        const value =
          ta.attribute?.data_type === "date" && raw ? (raw as dayjs.Dayjs).format("YYYY-MM-DD") : raw;
        return { attribute_id: ta.attribute_id, value };
      });
    saveAttributes(
      {
        url: `${API_URL}/products/${productId}/attributes`,
        method: "put",
        values: payload,
        config: { headers: { "Content-Type": "application/json" } },
      },
      {
        onSuccess: () => {
          message.success("Attributes saved");
          valuesQuery.refetch();
        },
        onError: (error: any) => message.error(error?.message ?? "Failed to save attributes"),
      },
    );
  };

  return (
    <Edit saveButtonProps={saveButtonProps} title="Edit product">
      <Form {...formProps} layout="vertical">
        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select
            options={[
              { label: "Draft", value: "draft" },
              { label: "Active", value: "active" },
              { label: "Archived", value: "archived" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Tax class" name="tax_class_id">
          <Select {...taxClassSelectProps} allowClear />
        </Form.Item>
      </Form>

      <Divider />

      <ProductMediaCard productId={productId} />

      <Divider />

      <TranslationsCard
        resourcePath="products"
        itemId={productId}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "short_description", label: "Short description", type: "textarea" },
          { name: "description", label: "Description (HTML)", type: "textarea" },
          { name: "meta_title", label: "Meta title" },
          { name: "meta_description", label: "Meta description", type: "textarea" },
        ]}
      />

      <Divider />

      <Card
        title="Attributes"
        extra={
          <Text type="secondary">
            Fields below are generated from this product's type -- not hard-coded.
          </Text>
        }
      >
        {excludedAttributes.length > 0 && (
          <Text type="warning" style={{ display: "block", marginBottom: 12 }}>
            Not editable here yet (translatable values aren't wired in this
            pass): {excludedAttributes.map((a) => a.code).join(", ")}. Add attributes for this
            product type on the Product Types page.
          </Text>
        )}
        {productAttributes.length === 0 ? (
          <Text type="secondary">No product-level attributes defined for this product type.</Text>
        ) : (
          <Form form={attrForm} layout="vertical" onFinish={onSaveAttributes}>
            {(productAttributes as ProductAttribute[]).map((ta) => {
              const attr = ta.attribute!;
              const options = optionsByAttribute.get(attr.id) ?? [];
              return (
                <Form.Item
                  key={attr.id}
                  label={attr.code}
                  name={attr.id}
                  valuePropName={attr.data_type === "boolean" ? "checked" : "value"}
                  rules={ta.is_required ? [{ required: true }] : []}
                >
                  {attr.data_type === "select" ? (
                    <Select
                      options={options.map((o) => ({ label: o.code, value: o.code }))}
                      allowClear
                    />
                  ) : attr.data_type === "multiselect" ? (
                    <Select
                      mode="multiple"
                      options={options.map((o) => ({ label: o.code, value: o.code }))}
                      allowClear
                    />
                  ) : attr.data_type === "boolean" ? (
                    <Checkbox />
                  ) : attr.data_type === "number" ? (
                    <InputNumber style={{ width: "100%" }} />
                  ) : attr.data_type === "date" ? (
                    <DatePicker />
                  ) : (
                    <Input />
                  )}
                </Form.Item>
              );
            })}
            <Button type="primary" htmlType="submit" loading={saveMutation.isPending}>
              Save attributes
            </Button>
          </Form>
        )}
      </Card>

      <Divider />

      <VariantsCard
        productId={productId}
        attributeDefs={variantAttributes}
        optionsByAttribute={optionsByAttribute}
      />
    </Edit>
  );
};
