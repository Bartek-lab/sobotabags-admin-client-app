import { Create } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, message } from "antd";
import { useNavigate } from "react-router";
import { useIssueGiftCard } from "../../hooks/use-issue-gift-card";

export const GiftCardIssue = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { issue, issuing } = useIssueGiftCard((code) => {
    message.success(`Issued ${code}`);
    navigate("/gift-cards");
  });

  return (
    <Create
      saveButtonProps={{ onClick: () => form.submit(), loading: issuing }}
      title="Issue gift card"
    >
      <Form form={form} layout="vertical" onFinish={issue}>
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
