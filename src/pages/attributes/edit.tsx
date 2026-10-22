import { Edit, useForm, useSelect } from "@refinedev/antd";
import { useCreate, useDelete, useList, type HttpError } from "@refinedev/core";
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
  Typography,
  message,
} from "antd";
import { TranslationsCard } from "../../components/translations-card";

const { Text } = Typography;

type AttributeOption = { id: string; code: string; sort_order: number | null };

export const AttributeEdit = () => {
  const { formProps, saveButtonProps, id, query } = useForm({});
  const dataType = query?.data?.data?.data_type as string | undefined;
  const { selectProps: groupSelectProps } = useSelect({
    resource: "attribute_groups",
    optionLabel: "code",
    optionValue: "id",
  });

  const showOptions = dataType === "select" || dataType === "multiselect";

  const { result: optionsResult, query: optionsQuery } = useList<AttributeOption>({
    resource: "attribute_options",
    filters: id ? [{ field: "attribute_id", operator: "eq", value: id }] : [],
    sorters: [{ field: "sort_order", order: "asc" }],
    queryOptions: { enabled: !!id && showOptions },
    pagination: { pageSize: 100 },
  });

  const { mutate: createOption } = useCreate();
  const { mutate: deleteOption } = useDelete();
  const [optionForm] = Form.useForm();

  const onAddOption = (values: { code: string }) => {
    createOption(
      { resource: "attribute_options", values: { attribute_id: id, code: values.code } },
      {
        onSuccess: () => {
          optionForm.resetFields();
          optionsQuery.refetch();
        },
        onError: (error: HttpError) => message.error(error.message ?? "Failed to add option"),
      },
    );
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Data type" name="data_type" rules={[{ required: true }]}>
          <Select
            options={[
              { label: "Text", value: "text" },
              { label: "Rich text", value: "rich_text" },
              { label: "Number", value: "number" },
              { label: "Boolean", value: "boolean" },
              { label: "Date", value: "date" },
              { label: "Select", value: "select" },
              { label: "Multiselect", value: "multiselect" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Group" name="group_id">
          <Select {...groupSelectProps} allowClear />
        </Form.Item>
        <Form.Item label="Unit (number type only)" name="unit">
          <Input />
        </Form.Item>
        <Form.Item label="Translatable" name="is_translatable" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item label="Filterable" name="is_filterable" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item label="Visible" name="is_visible" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item label="Sort order" name="sort_order">
          <InputNumber />
        </Form.Item>
      </Form>

      <Divider />

      <TranslationsCard
        resourcePath="attributes"
        itemId={id as string | undefined}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "description", label: "Help text", type: "textarea" },
        ]}
      />

      {showOptions && (
        <>
          <Divider />
          <Card
            title="Options"
            extra={
              <Text type="secondary">
                Per-option labels (attribute_option_translations) aren't wired in this pass --
                the code is shown everywhere for now.
              </Text>
            }
          >
            <Table
              dataSource={optionsResult?.data ?? []}
              rowKey="id"
              pagination={false}
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Table.Column dataIndex="code" title="Code" />
              <Table.Column dataIndex="sort_order" title="Sort" />
              <Table.Column
                title=""
                render={(_, record: AttributeOption) => (
                  <Button
                    danger
                    size="small"
                    onClick={() =>
                      deleteOption(
                        { resource: "attribute_options", id: record.id },
                        { onSuccess: () => optionsQuery.refetch() },
                      )
                    }
                  >
                    Remove
                  </Button>
                )}
              />
            </Table>
            <Form form={optionForm} layout="inline" onFinish={onAddOption}>
              <Form.Item name="code" rules={[{ required: true }]}>
                <Input placeholder="new option code, e.g. navy" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Add option
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </>
      )}
    </Edit>
  );
};
