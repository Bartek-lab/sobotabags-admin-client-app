import { Create, useForm, useSelect } from "@refinedev/antd";
import { Form, Select } from "antd";

// Deliberately minimal: a product is always created as a bare draft
// (trg_products_guard_publish rejects creating one as 'active' directly
// regardless of entry point) -- attributes, translations, and variants are
// added afterwards on the edit screen, which is where the real complexity
// (and the real custom code) lives.
export const ProductCreate = () => {
  const { formProps, saveButtonProps } = useForm({ redirect: "edit" });
  const { selectProps: typeSelectProps } = useSelect({
    resource: "product_types",
    optionLabel: "name",
    optionValue: "id",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Product type" name="product_type_id" rules={[{ required: true }]}>
          <Select {...typeSelectProps} />
        </Form.Item>
      </Form>
    </Create>
  );
};
