import { Create, useForm } from "@refinedev/antd";
import { Checkbox, DatePicker, Form, Input, InputNumber, Select, Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

// promotions.code is an internal identifier only (DB-enforced lowercase
// code_key, e.g. 'summer_sale_2026') -- NOT what a customer types at
// checkout. That's a separate promotion_codes row, added after creating the
// promotion here (see the Codes section on the edit page) -- a promotion
// with no code attached can never actually be redeemed.
const normalizeCode = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^[^a-z]+/, "");
};

export const PromotionCreate = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Internal code"
          name="code"
          rules={[{ required: true }]}
          normalize={normalizeCode}
          extra="Internal identifier only, not what customers type -- add the real redeemable code(s) after creating, on the edit page."
        >
          <Input placeholder="summer_sale_2026" />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Summer sale 2026" />
        </Form.Item>
        <Form.Item label="Type" name="type" rules={[{ required: true }]} initialValue="percentage">
          <Select
            options={[
              { label: "Percentage", value: "percentage" },
              { label: "Fixed amount", value: "fixed_amount" },
              { label: "Free shipping", value: "free_shipping" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Percentage"
          name="percentage"
          extra="Required when type = Percentage, ignored otherwise."
        >
          <InputNumber min={0.01} max={100} style={{ width: "100%" }} />
        </Form.Item>
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Fixed-amount discounts (PLN amount off, minimum order) are configured after creating, on
          the edit page -- they live in a separate table.
        </Text>

        <Form.Item
          label="Starts at"
          name="starts_at"
          rules={[{ required: true }]}
          initialValue={dayjs()}
          getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
          normalize={(value) => (value ? dayjs(value).toISOString() : value)}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Ends at (optional)"
          name="ends_at"
          getValueProps={(value) => ({ value: value ? dayjs(value) : undefined })}
          normalize={(value) => (value ? dayjs(value).toISOString() : value)}
        >
          <DatePicker showTime style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item label="Usage limit (total, optional)" name="usage_limit">
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Usage limit per customer (optional)" name="usage_limit_per_customer">
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Registered customers only"
          name="registered_customers_only"
          valuePropName="checked"
          initialValue={false}
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          label="First order only"
          name="first_order_only"
          valuePropName="checked"
          initialValue={false}
        >
          <Checkbox />
        </Form.Item>
        <Form.Item label="Active" name="is_active" valuePropName="checked" initialValue={true}>
          <Checkbox />
        </Form.Item>
      </Form>
    </Create>
  );
};
