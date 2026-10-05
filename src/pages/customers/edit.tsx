import { Edit, useForm, useSelect } from "@refinedev/antd";
import { Form, Input, Select, Typography } from "antd";

const { Text } = Typography;

// No "create" route -- customers only ever come from the auth.users signup
// trigger (see app/resources/customers.py). Email is read-only here too:
// it's synced from Supabase Auth by a DB trigger, so editing it in this form
// would silently drift from the customer's real login email.
export const CustomerEdit = () => {
  const { formProps, saveButtonProps, query } = useForm({});
  const email = query?.data?.data?.email as string | undefined;

  const { selectProps: localeSelectProps } = useSelect({
    resource: "locales",
    optionLabel: "name",
    optionValue: "code",
  });

  return (
    <Edit saveButtonProps={saveButtonProps} canDelete={false}>
      <Form.Item label="Email">
        <Input value={email} disabled />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Managed by Supabase Auth -- not editable here.
        </Text>
      </Form.Item>
      <Form {...formProps} layout="vertical">
        <Form.Item label="First name" name="first_name">
          <Input />
        </Form.Item>
        <Form.Item label="Last name" name="last_name">
          <Input />
        </Form.Item>
        <Form.Item label="Phone" name="phone">
          <Input placeholder="+48123456789" />
        </Form.Item>
        <Form.Item label="Locale" name="locale">
          <Select {...localeSelectProps} allowClear />
        </Form.Item>
        <Form.Item label="Status" name="status" rules={[{ required: true }]}>
          <Select
            options={[
              { label: "Active", value: "active" },
              { label: "Disabled", value: "disabled" },
              { label: "Anonymized", value: "anonymized" },
            ]}
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
