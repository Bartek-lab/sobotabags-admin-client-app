import { Create, useForm, useSelect } from "@refinedev/antd";
import { Checkbox, Form, Input, Select } from "antd";

export const ProductTypeCreate = () => {
  const { formProps, saveButtonProps } = useForm({});
  const { selectProps: taxClassSelectProps } = useSelect({
    resource: "tax_classes",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input placeholder="handbag" />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Handbag" />
        </Form.Item>
        <Form.Item label="Shippable" name="is_shippable" valuePropName="checked" initialValue={true}>
          <Checkbox />
        </Form.Item>
        <Form.Item label="Default tax class" name="default_tax_class_id">
          <Select {...taxClassSelectProps} allowClear />
        </Form.Item>
      </Form>
    </Create>
  );
};
