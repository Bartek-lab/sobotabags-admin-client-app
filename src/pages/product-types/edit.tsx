import { Edit, useForm, useSelect } from "@refinedev/antd";
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

type Attribute = { id: string; code: string };
type TypeAttributeRow = {
  product_type_id: string;
  attribute_id: string;
  level: string;
  is_required: boolean | null;
  sort_order: number | null;
};

export const ProductTypeEdit = () => {
  const { formProps, saveButtonProps, id } = useForm({});
  const { selectProps: taxClassSelectProps } = useSelect({
    resource: "tax_classes",
    optionLabel: "name",
    optionValue: "id",
  });

  const { selectProps: attributeSelectProps } = useSelect({
    resource: "attributes",
    optionLabel: "code",
    optionValue: "id",
  });

  const { result: attributesResult } = useList<Attribute>({
    resource: "attributes",
    pagination: { pageSize: 200 },
  });
  const attributeCodeById = new Map(
    (attributesResult?.data ?? []).map((a) => [a.id, a.code]),
  );

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
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Shippable" name="is_shippable" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item label="Default tax class" name="default_tax_class_id">
          <Select {...taxClassSelectProps} allowClear />
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
            <Select {...attributeSelectProps} style={{ width: 160 }} placeholder="Attribute" />
          </Form.Item>
          <Form.Item name="level" rules={[{ required: true }]} initialValue="product">
            <Select
              style={{ width: 140 }}
              options={[
                { label: "Product", value: "product" },
                { label: "Variant axis", value: "variant_axis" },
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
