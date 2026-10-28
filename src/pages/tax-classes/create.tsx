import { Create, useForm } from "@refinedev/antd";
import { Checkbox, Form, Input } from "antd";

export const TaxClassCreate = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input placeholder="standard" />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Standard VAT" />
        </Form.Item>
        <Form.Item label="Default" name="is_default" valuePropName="checked">
          <Checkbox />
        </Form.Item>
      </Form>
    </Create>
  );
};
