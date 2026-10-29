import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";

export const ProductTypeCreate = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input placeholder="handbag" />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Handbag" />
        </Form.Item>
      </Form>
    </Create>
  );
};
