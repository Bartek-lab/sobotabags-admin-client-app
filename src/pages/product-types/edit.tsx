import { Edit, useForm } from "@refinedev/antd";
import { useCreate, useList, type HttpError } from "@refinedev/core";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  message,
} from "antd";
import { useRemoveProductTypeAttribute } from "../../hooks/use-product-type-attributes";

type Attribute = { id: string; code: string; data_type: string };
type TypeAttributeRow = {
  product_type_id: string;
  attribute_id: string;
  level: string;
  is_required: boolean | null;
  sort_order: number | null;
};

export const ProductTypeEdit = () => {
  const { formProps, saveButtonProps, formLoading, id } = useForm({});

  const { result: attributesResult } = useList<Attribute>({
    resource: "attributes",
    pagination: { pageSize: 200 },
  });
  const attributes = attributesResult?.data ?? [];
  const attributeCodeById = new Map(attributes.map((a) => [a.id, a.code]));

  const { result: typeAttrsResult, query: typeAttrsQuery } = useList<TypeAttributeRow>({
    resource: "product_type_attributes",
    filters: id ? [{ field: "product_type_id", operator: "eq", value: id }] : [],
    sorters: [{ field: "sort_order", order: "asc" }],
    queryOptions: { enabled: !!id },
    pagination: { pageSize: 100 },
  });

  const { mutate: createAssociation } = useCreate();
  const removeAssociation = useRemoveProductTypeAttribute(id as string | undefined, () => typeAttrsQuery.refetch());
  const [addForm] = Form.useForm();
  const selectedLevel = Form.useWatch("level", addForm);

  // multiselect can't be attached at variant level -- variant_attribute_values
  // holds exactly one value per variant+attribute (enforced by
  // trg_product_type_attributes_check, same rule as "variant axis must be
  // select"). Filtered out of the list here so it's never selectable in the
  // first place, not just rejected after submitting.
  const availableAttributes = attributes.filter(
    (a) => !(selectedLevel === "variant" && a.data_type === "multiselect"),
  );

  const onLevelChange = (level: string) => {
    const attrId = addForm.getFieldValue("attribute_id");
    const attr = attributes.find((a) => a.id === attrId);
    if (level === "variant" && attr?.data_type === "multiselect") {
      addForm.setFieldValue("attribute_id", undefined);
    }
  };

  const onAdd = (values: {
    attribute_id: string;
    level: string;
    is_required?: boolean;
    sort_order?: number;
  }) => {
    createAssociation(
      {
        resource: "product_type_attributes",
        values: {
          product_type_id: id,
          attribute_id: values.attribute_id,
          level: values.level,
          is_required: values.is_required ?? false,
          sort_order: values.sort_order ?? 0,
        },
      },
      {
        onSuccess: () => {
          addForm.resetFields();
          typeAttrsQuery.refetch();
        },
        onError: (error: HttpError) => message.error(error.message ?? "Failed to add attribute"),
      },
    );
  };

  const onRemove = (attributeId: string) => {
    removeAssociation(attributeId);
  };

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>

      <Divider />

      <Card title="Attributes for this type">
        <Table
          dataSource={typeAttrsResult?.data ?? []}
          rowKey={(r) => r.attribute_id}
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Table.Column
            title="Attribute"
            render={(_, r: TypeAttributeRow) => attributeCodeById.get(r.attribute_id) ?? r.attribute_id}
          />
          <Table.Column dataIndex="level" title="Level" />
          <Table.Column
            dataIndex="is_required"
            title="Required"
            render={(v: boolean) => (v ? "yes" : "no")}
          />
          <Table.Column dataIndex="sort_order" title="Sort" />
          <Table.Column
            title=""
            render={(_, r: TypeAttributeRow) => (
              <Button danger size="small" onClick={() => onRemove(r.attribute_id)}>
                Remove
              </Button>
            )}
          />
        </Table>

        <Form form={addForm} layout="inline" onFinish={onAdd}>
          <Form.Item name="attribute_id" rules={[{ required: true }]}>
            <Select
              style={{ width: 160 }}
              placeholder="Attribute"
              options={availableAttributes.map((a) => ({ label: a.code, value: a.id }))}
            />
          </Form.Item>
          <Form.Item
            name="level"
            rules={[{ required: true }]}
            initialValue="product"
            extra="Multiselect attributes can only be product-level."
          >
            <Select
              style={{ width: 140 }}
              onChange={onLevelChange}
              options={[
                { label: "Product", value: "product" },
                { label: "Variant", value: "variant" },
              ]}
            />
          </Form.Item>
          <Form.Item name="is_required" valuePropName="checked">
            <Checkbox>Required</Checkbox>
          </Form.Item>
          <Form.Item name="sort_order" initialValue={0}>
            <InputNumber placeholder="Sort" style={{ width: 80 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Edit>
  );
};
