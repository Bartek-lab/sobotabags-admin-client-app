import { Create, useForm, useSelect } from "@refinedev/antd";
import { Checkbox, Form, Input, InputNumber, Select } from "antd";

export const AttributeCreate = () => {
  const { formProps, saveButtonProps } = useForm({ redirect: "edit" });
  const { selectProps: groupSelectProps } = useSelect({
    resource: "attribute_groups",
    optionLabel: "code",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input placeholder="color" />
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
          <Input placeholder="cm" />
        </Form.Item>
        <Form.Item label="Translatable" name="is_translatable" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item
          label="Filterable (storefront facet)"
          name="is_filterable"
          valuePropName="checked"
        >
          <Checkbox />
        </Form.Item>
        <Form.Item label="Visible" name="is_visible" valuePropName="checked" initialValue={true}>
          <Checkbox />
        </Form.Item>
        <Form.Item label="Sort order" name="sort_order" initialValue={0}>
          <InputNumber />
        </Form.Item>
      </Form>
    </Create>
  );
};
