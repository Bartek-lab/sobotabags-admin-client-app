import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Checkbox, Divider, Form, Input, InputNumber, Select } from "antd";
import { TranslationsCard } from "../../components/translations-card";

export const CategoryEdit = () => {
  const { formProps, saveButtonProps, formLoading, id } = useForm({});
  const { selectProps: parentSelectProps } = useSelect({
    resource: "categories",
    optionLabel: "code",
    optionValue: "id",
    // A category can't be its own parent -- trg_categories_prevent_cycle
    // enforces this at the DB level regardless, but filtering it out of the
    // picker avoids the error round-trip for the single-level case.
    filters: id ? [{ field: "id", operator: "ne", value: id }] : [],
  });

  return (
    <Edit saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Parent category" name="parent_id">
          <Select {...parentSelectProps} allowClear />
        </Form.Item>
        <Form.Item label="Sort order" name="sort_order">
          <InputNumber />
        </Form.Item>
        <Form.Item label="Active" name="is_active" valuePropName="checked">
          <Checkbox />
        </Form.Item>
      </Form>

      <Divider />

      <TranslationsCard
        resourcePath="categories"
        itemId={id as string | undefined}
        fields={[
          { name: "name", label: "Name", required: true },
          { name: "slug", label: "Slug", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "meta_title", label: "Meta title" },
          { name: "meta_description", label: "Meta description", type: "textarea" },
        ]}
      />
    </Edit>
  );
};
