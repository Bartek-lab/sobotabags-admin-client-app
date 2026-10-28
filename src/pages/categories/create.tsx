import { Create, useForm, useSelect } from "@refinedev/antd";
import { Checkbox, Form, Input, InputNumber, Select } from "antd";

export const CategoryCreate = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({ redirect: "edit" });
  const { selectProps: parentSelectProps } = useSelect({
    resource: "categories",
    optionLabel: "code",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input placeholder="handbags" />
        </Form.Item>
        <Form.Item label="Parent category" name="parent_id">
          <Select {...parentSelectProps} allowClear />
        </Form.Item>
        <Form.Item label="Sort order" name="sort_order" initialValue={0}>
          <InputNumber />
        </Form.Item>
        <Form.Item label="Active" name="is_active" valuePropName="checked" initialValue={true}>
          <Checkbox />
        </Form.Item>
      </Form>
    </Create>
  );
};
