import { useCustom, useCustomMutation } from "@refinedev/core";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { API_URL } from "../providers/constants";

const { Text } = Typography;

type AttributeOption = { id: string; attribute_id: string; code: string };
type AttributeDef = {
  attribute_id: string;
  level: string;
  is_required: boolean | null;
  attribute?: { id: string; code: string; data_type: string };
};
type VariantAttributeValue = { attribute_id: string; code: string; data_type: string; value: unknown };
type Variant = {
  id: string;
  sku: string;
  is_active: boolean;
  quantity_on_hand: number;
  ship_weight_g: number | null;
  ship_length_mm: number | null;
  ship_width_mm: number | null;
  ship_height_mm: number | null;
  price_amount: number | null;
  attributes: VariantAttributeValue[];
};

// Same reasoning as ProductMediaCard/TranslationsCard: a variant's price and
// axis/scalar attribute values live in composite-PK tables generic CRUD
// can't address, so this goes through the dedicated endpoint
// (app/routers/variants.py) instead of useCreate/useUpdate.
export const VariantsCard = ({
  productId,
  attributeDefs,
  optionsByAttribute,
}: {
  productId?: string;
  attributeDefs: AttributeDef[];
  optionsByAttribute: Map<string, AttributeOption[]>;
}) => {
  const { result, query } = useCustom<Variant[]>({
    url: `${API_URL}/products/${productId}/variants`,
    method: "get",
    queryOptions: { enabled: !!productId },
  });
  const variants = Array.isArray(result?.data) ? result.data : [];

  const { mutate: createVariant, mutation: createMutation } = useCustomMutation();
  const { mutate: updateVariant, mutation: updateMutation } = useCustomMutation();
  const { mutate: deleteVariant } = useCustomMutation();

  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Variant | null>(null);
  // Set only when the modal was opened via "Copy" -- distinguishes a true
  // blank create (defaults to empty/zero) from a copy (prefills everything
  // except SKU and the variant_axis attributes, which must differ for this
  // to be a distinct, sellable variant).
  const [copyingFrom, setCopyingFrom] = useState<Variant | null>(null);

  useEffect(() => {
    if (!modalOpen) return;
    if (editing) {
      const initial: Record<string, unknown> = {
        sku: editing.sku,
        is_active: editing.is_active,
        quantity_on_hand: editing.quantity_on_hand,
        ship_weight_g: editing.ship_weight_g,
        ship_length_mm: editing.ship_length_mm,
        ship_width_mm: editing.ship_width_mm,
        ship_height_mm: editing.ship_height_mm,
        price: editing.price_amount != null ? editing.price_amount / 100 : undefined,
      };
      for (const av of editing.attributes) initial[av.attribute_id] = av.value;
      form.setFieldsValue(initial);
    } else if (copyingFrom) {
      const initial: Record<string, unknown> = {
        sku: "",
        is_active: true,
        quantity_on_hand: 0,
        ship_weight_g: copyingFrom.ship_weight_g,
        ship_length_mm: copyingFrom.ship_length_mm,
        ship_width_mm: copyingFrom.ship_width_mm,
        ship_height_mm: copyingFrom.ship_height_mm,
        price: copyingFrom.price_amount != null ? copyingFrom.price_amount / 100 : undefined,
      };
      // Only carry over scalar (level="variant") values, e.g. width/height/
      // depth -- axis values (level="variant_axis", e.g. color/size) are
      // deliberately left blank so the admin must pick a new one, which is
      // the entire point of "same bag, different color."
      const axisAttributeIds = new Set(
        attributeDefs.filter((d) => d.level === "variant_axis").map((d) => d.attribute_id),
      );
      for (const av of copyingFrom.attributes) {
        if (!axisAttributeIds.has(av.attribute_id)) initial[av.attribute_id] = av.value;
      }
      form.setFieldsValue(initial);
    } else {
      form.resetFields();
      form.setFieldsValue({ is_active: true, quantity_on_hand: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen, editing, copyingFrom]);

  const openCreate = () => {
    setEditing(null);
    setCopyingFrom(null);
    setModalOpen(true);
  };
  const openEdit = (v: Variant) => {
    setEditing(v);
    setCopyingFrom(null);
    setModalOpen(true);
  };
  const openCopy = (v: Variant) => {
    setEditing(null);
    setCopyingFrom(v);
    setModalOpen(true);
  };

  const onSubmit = (values: Record<string, unknown>) => {
    const attributes = attributeDefs
      .map((def) => ({ attribute_id: def.attribute_id, value: values[def.attribute_id] }))
      .filter((a) => a.value !== undefined && a.value !== null && a.value !== "");

    const body = {
      sku: values.sku,
      is_active: !!values.is_active,
      quantity_on_hand: values.quantity_on_hand ?? 0,
      ship_weight_g: values.ship_weight_g ?? null,
      ship_length_mm: values.ship_length_mm ?? null,
      ship_width_mm: values.ship_width_mm ?? null,
      ship_height_mm: values.ship_height_mm ?? null,
      price_amount:
        values.price !== undefined && values.price !== null
          ? Math.round((values.price as number) * 100)
          : null,
      attributes,
    };

    const onSuccess = () => {
      message.success(editing ? "Variant updated" : "Variant created");
      setModalOpen(false);
      query.refetch();
    };
    const onError = (error: any) => message.error(error?.message ?? "Failed to save variant");
    const config = { headers: { "Content-Type": "application/json" } };

    if (editing) {
      updateVariant(
        { url: `${API_URL}/products/${productId}/variants/${editing.id}`, method: "put", values: body, config },
        { onSuccess, onError },
      );
    } else {
      createVariant(
        { url: `${API_URL}/products/${productId}/variants`, method: "post", values: body, config },
        { onSuccess, onError },
      );
    }
  };

  const onDelete = (variantId: string) => {
    deleteVariant(
      { url: `${API_URL}/products/${productId}/variants/${variantId}`, method: "delete", values: {} },
      {
        onSuccess: () => {
          message.success("Variant deleted");
          query.refetch();
        },
        onError: (error: any) => message.error(error?.message ?? "Failed to delete variant"),
      },
    );
  };

  if (!productId) return null;

  return (
    <Card
      title="Variants"
      extra={
        <Button type="primary" onClick={openCreate}>
          Add variant
        </Button>
      }
    >
      <Table dataSource={variants} rowKey="id" pagination={false} size="small">
        <Table.Column dataIndex="sku" title="SKU" />
        <Table.Column
          dataIndex="is_active"
          title="Active"
          render={(v: boolean) => (v ? "yes" : "no")}
        />
        <Table.Column
          dataIndex="price_amount"
          title="Price"
          render={(v: number | null) => (v != null ? (v / 100).toFixed(2) : "--")}
        />
        <Table.Column
          dataIndex="quantity_on_hand"
          title="Stock"
          render={(v: number) => (
            <Text type={v === 0 ? "danger" : v <= 5 ? "warning" : undefined}>{v}</Text>
          )}
        />
        {attributeDefs.map((def) => (
          <Table.Column
            key={def.attribute_id}
            title={def.attribute?.code}
            render={(_, r: Variant) =>
              r.attributes.find((a) => a.attribute_id === def.attribute_id)?.value ?? "--"
            }
          />
        ))}
        <Table.Column
          title=""
          render={(_, r: Variant) => (
            <>
              <Button size="small" onClick={() => openEdit(r)} style={{ marginRight: 8 }}>
                Edit
              </Button>
              <Button size="small" onClick={() => openCopy(r)} style={{ marginRight: 8 }}>
                Copy
              </Button>
              <Button danger size="small" onClick={() => onDelete(r.id)}>
                Delete
              </Button>
            </>
          )}
        />
      </Table>

      <Modal
        title={editing ? "Edit variant" : copyingFrom ? `Copy variant (from ${copyingFrom.sku})` : "Add variant"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          {copyingFrom && (
            <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
              Copied price, shipping dimensions, and non-color/size attributes from{" "}
              {copyingFrom.sku} -- pick a new SKU and color/size below.
            </Text>
          )}
          <Form.Item
            label="SKU"
            name="sku"
            rules={[
              { required: true },
              { pattern: /^[A-Za-z0-9._-]{1,64}$/, message: "letters, numbers, . _ - only" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Checkbox />
          </Form.Item>
          <Form.Item
            label="Stock"
            name="quantity_on_hand"
            rules={[{ required: true }]}
            extra="How many units are actually in hand right now."
          >
            <InputNumber min={0} step={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Price" name="price" extra="In whole currency units, e.g. 100 = 100.00">
            <InputNumber min={0} step={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Weight (g)" name="ship_weight_g">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Length (mm)" name="ship_length_mm">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Width (mm)" name="ship_width_mm">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Height (mm)" name="ship_height_mm">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          {attributeDefs.map((def) => {
            const attr = def.attribute!;
            const options = optionsByAttribute.get(attr.id) ?? [];
            return (
              <Form.Item
                key={attr.id}
                label={attr.code}
                name={attr.id}
                rules={def.is_required ? [{ required: true }] : []}
              >
                {attr.data_type === "select" ? (
                  <Select
                    options={options.map((o) => ({ label: o.code, value: o.code }))}
                    allowClear
                  />
                ) : (
                  <InputNumber style={{ width: "100%" }} />
                )}
              </Form.Item>
            );
          })}
          {attributeDefs.length === 0 && (
            <Text type="secondary">No variant-level attributes defined for this product type.</Text>
          )}
        </Form>
      </Modal>
    </Card>
  );
};
