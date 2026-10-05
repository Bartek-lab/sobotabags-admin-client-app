import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Select } from "antd";

export const GiftCardEdit = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select
            options={[
              { label: "Active", value: "active" },
              { label: "Disabled", value: "disabled" },
              { label: "Expired", value: "expired" },
            ]}
          />
        </Form.Item>
        <Form.Item label="Recipient email" name="recipient_email">
          <Input type="email" />
        </Form.Item>
      </Form>
    </Edit>
  );
};
