import { Create } from "@refinedev/antd";
import { useCustomMutation } from "@refinedev/core";
import { Form, Input, InputNumber, Select, message } from "antd";
import { useNavigate } from "react-router";
import { API_URL } from "../../providers/constants";

// Not a generic create -- calls the dedicated transactional endpoint
// (app/routers/gift_cards.py) that inserts the gift_cards row AND the
// 'issued' gift_card_transactions row together, which is the only way the
// balance ends up correct.
export const GiftCardIssue = () => {
  const navigate = useNavigate();
  const { mutate, mutation } = useCustomMutation();
  const [form] = Form.useForm();

  const onFinish = (values: { currency: string; initial_amount: number; recipient_email?: string }) => {
    mutate(
      {
        url: `${API_URL}/gift-cards/issue`,
        method: "post",
        values: {
          currency: values.currency,
          initial_amount: Math.round(values.initial_amount * 100),
          recipient_email: values.recipient_email || undefined,
        },
        config: { headers: { "Content-Type": "application/json" } },
      },
      {
        onSuccess: ({ data }) => {
          message.success(`Issued ${data.code}`);
          navigate("/gift-cards");
        },
        onError: (error: any) => {
          message.error(error?.message ?? "Failed to issue gift card");
        },
      },
    );
  };

  return (
    <Create
      saveButtonProps={{ onClick: () => form.submit(), loading: mutation.isPending }}
      title="Issue gift card"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Currency" name="currency" rules={[{ required: true }]} initialValue="PLN">
          <Select
            options={[
              { label: "PLN", value: "PLN" },
              { label: "EUR", value: "EUR" },
            ]}
          />
        </Form.Item>
        <Form.Item
          label="Amount"
          name="initial_amount"
          rules={[{ required: true }]}
          extra="In whole currency units, e.g. 100 = 100.00 PLN"
        >
          <InputNumber min={0.01} step={1} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Recipient email (optional)" name="recipient_email">
          <Input type="email" />
        </Form.Item>
      </Form>
    </Create>
  );
};
