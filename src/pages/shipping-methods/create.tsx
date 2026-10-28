import { Create, useForm } from "@refinedev/antd";
import { Checkbox, Form, Input, InputNumber } from "antd";

// price_amount/free_above_amount are stored in grosze (minor units) like
// every other money column -- getValueProps/normalize do the PLN<->grosze
// conversion at the form boundary so the admin types "14.99", not "1499".
export const ShippingMethodCreate = () => {
  const { formProps, saveButtonProps, formLoading } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps} isLoading={formLoading}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input placeholder="inpost_locker" />
        </Form.Item>
        <Form.Item label="Carrier code" name="carrier_code" rules={[{ required: true }]}>
          <Input placeholder="inpost" />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Paczkomat InPost" />
        </Form.Item>
        <Form.Item
          label="Requires pickup point"
          name="requires_pickup_point"
          valuePropName="checked"
          extra="On for parcel-locker delivery (no street address needed); off for courier delivery."
        >
          <Checkbox />
        </Form.Item>
        <Form.Item
          label="Price (PLN)"
          name="price_amount"
          rules={[{ required: true }]}
          getValueProps={(value) => ({ value: value != null ? value / 100 : value })}
          normalize={(value) => (value != null ? Math.round(value * 100) : value)}
        >
          <InputNumber min={0} step={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Free above (PLN)"
          name="free_above_amount"
          extra="Leave empty for no free-shipping threshold on this method."
          getValueProps={(value) => ({ value: value != null ? value / 100 : value })}
          normalize={(value) => (value != null ? Math.round(value * 100) : value)}
        >
          <InputNumber min={0} step={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Active" name="is_active" valuePropName="checked" initialValue={true}>
          <Checkbox />
        </Form.Item>
        <Form.Item label="Sort order" name="sort_order" initialValue={0}>
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Create>
  );
};
