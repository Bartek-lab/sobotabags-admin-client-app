import { Edit, useForm } from "@refinedev/antd";
import { Checkbox, Form, Input, InputNumber } from "antd";

export const ShippingMethodEdit = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Code" name="code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Carrier code" name="carrier_code" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
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
        <Form.Item label="Active" name="is_active" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item label="Sort order" name="sort_order">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
      </Form>
    </Edit>
  );
};
