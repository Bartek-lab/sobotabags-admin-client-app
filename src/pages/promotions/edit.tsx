import { Edit, useForm } from "@refinedev/antd";
import { useCreate, useCustom, useCustomMutation, useDelete, useList } from "@refinedev/core";
import {
  Button,
  Card,
  Checkbox,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect } from "react";
import { API_URL } from "../../providers/constants";

const { Text } = Typography;

const normalizeCode = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^[^a-z]+/, "");
};

type PromotionCodeRow = {
  id: string;
  promotion_id: string;
  code: string;
  usage_limit: number | null;
  is_active: boolean | null;
};

type CurrencyValue = { promotion_id: string; currency: string; amount_off: number; min_subtotal: number | null };

const CURRENCY = "PLN";

export const PromotionEdit = () => {
  const { formProps, saveButtonProps, id } = useForm({});
  const type = Form.useWatch("type", formProps.form);

  // --- redeemable codes (promotion_codes) -- without at least one of
  // these, this promotion can never actually be found at checkout
  // (api-shop's _resolve_promo looks it up exclusively by promotion_codes.code).
  const { result: codesResult, query: codesQuery } = useList<PromotionCodeRow>({
    resource: "promotion_codes",
    filters: id ? [{ field: "promotion_id", operator: "eq", value: id }] : [],
    queryOptions: { enabled: !!id },
    pagination: { pageSize: 100 },
  });
  const { mutate: createCode } = useCreate();
  const { mutate: deleteCode } = useDelete();
  const [codeForm] = Form.useForm();

  const onAddCode = (values: { code: string; usage_limit?: number }) => {
    createCode(
      {
        resource: "promotion_codes",
        values: { promotion_id: id, code: values.code, usage_limit: values.usage_limit ?? null, is_active: true },
      },
      {
        onSuccess: () => {
          codeForm.resetFields();
          codesQuery.refetch();
        },
        onError: (error: any) => message.error(error?.message ?? "Failed to add code"),
      },
    );
  };

  const onRemoveCode = (codeId: string) => {
    deleteCode(
      { resource: "promotion_codes", id: codeId },
      { onSuccess: () => codesQuery.refetch() },
    );
  };

  // --- fixed-amount PLN value (promotion_currency_values) -- only relevant
  // when type = fixed_amount; a composite-PK table generic CRUD can't fully
  // express, so this reads/writes it directly via the custom-URL escape
  // hatch instead of useForm's own save (same reasoning as product
  // attributes: a different table, a different save button would be
  // confusing, so this one saves itself independently via its own button).
  const { result: currencyValueResult, query: currencyValueQuery } = useCustom<CurrencyValue>({
    url: `${API_URL}/promotion_currency_values/${id}`,
    method: "get",
    queryOptions: { enabled: !!id && type === "fixed_amount", retry: false },
    // A fresh fixed_amount promotion has no currency value row yet -- a 404
    // here is the expected, normal state, not something to alarm the admin
    // about with an error toast.
    errorNotification: false,
  });
  const { mutate: saveCurrencyValue, mutation: saveCurrencyValueMutation } = useCustomMutation();
  const [currencyForm] = Form.useForm();

  useEffect(() => {
    if (currencyValueResult?.data) {
      currencyForm.setFieldsValue({
        amount_off: currencyValueResult.data.amount_off / 100,
        min_subtotal: currencyValueResult.data.min_subtotal != null ? currencyValueResult.data.min_subtotal / 100 : undefined,
      });
    }
  }, [currencyValueResult, currencyForm]);

  const onSaveCurrencyValue = (values: { amount_off: number; min_subtotal?: number }) => {
    const exists = !!currencyValueResult?.data;
    const payload = {
      promotion_id: id,
      currency: CURRENCY,
      amount_off: Math.round(values.amount_off * 100),
      min_subtotal: values.min_subtotal != null ? Math.round(values.min_subtotal * 100) : null,
    };
    saveCurrencyValue(
      exists
        ? {
            url: `${API_URL}/promotion_currency_values/${id}`,
            method: "patch",
            values: payload,
            config: { headers: { "Content-Type": "application/json" } },
          }
        : {
            url: `${API_URL}/promotion_currency_values`,
            method: "post",
            values: payload,
            config: { headers: { "Content-Type": "application/json" } },
          },
      {
        onSuccess: () => {
          message.success("Discount amount saved");
          currencyValueQuery.refetch();
        },
        onError: (error: any) => message.error(error?.message ?? "Failed to save discount amount"),
      },
    );
  };

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Internal code"
          name="code"
          rules={[{ required: true }]}
          normalize={normalizeCode}
          extra="Internal identifier only, not what customers type -- see Codes below."
        >
          <Input />
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Type" name="type" rules={[{ required: true }]}>
          <Input disabled />
        </Form.Item>
        {type === "percentage" && (
          <Form.Item label="Percentage" name="percentage" rules={[{ required: true }]}>
            <InputNumber min={0.01} max={100} style={{ width: "100%" }} />
          </Form.Item>
        )}

        <Form.Item
          label="Starts at"
          name="starts_at"
          rules={[{ required: true }]}
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
        <Form.Item label="Registered customers only" name="registered_customers_only" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item label="First order only" name="first_order_only" valuePropName="checked">
          <Checkbox />
        </Form.Item>
        <Form.Item label="Active" name="is_active" valuePropName="checked">
          <Checkbox />
        </Form.Item>
      </Form>

      {type === "fixed_amount" && (
        <>
          <Divider />
          <Card title={`Discount amount (${CURRENCY})`}>
            <Form form={currencyForm} layout="inline" onFinish={onSaveCurrencyValue}>
              <Form.Item label="Amount off" name="amount_off" rules={[{ required: true }]}>
                <InputNumber min={0.01} step={1} style={{ width: 120 }} />
              </Form.Item>
              <Form.Item label="Minimum order (optional)" name="min_subtotal">
                <InputNumber min={0} step={1} style={{ width: 140 }} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={saveCurrencyValueMutation.isPending}>
                  Save
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </>
      )}

      <Divider />

      <Card
        title="Codes"
        extra={
          <Text type="secondary">What customers actually type at checkout.</Text>
        }
      >
        <Table
          dataSource={codesResult?.data ?? []}
          rowKey="id"
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Table.Column dataIndex="code" title="Code" />
          <Table.Column
            dataIndex="usage_limit"
            title="Usage limit"
            render={(v: number | null) => v ?? <Text type="secondary">unlimited</Text>}
          />
          <Table.Column
            dataIndex="is_active"
            title="Active"
            render={(v: boolean) => (v ? <Tag color="green">active</Tag> : <Tag>inactive</Tag>)}
          />
          <Table.Column
            title=""
            render={(_, r: PromotionCodeRow) => (
              <Button danger size="small" onClick={() => onRemoveCode(r.id)}>
                Remove
              </Button>
            )}
          />
        </Table>

        <Form form={codeForm} layout="inline" onFinish={onAddCode}>
          <Form.Item
            name="code"
            rules={[
              { required: true },
              { pattern: /^[A-Za-z0-9_-]{3,64}$/, message: "letters, numbers, _ and - only, 3-64 chars" },
            ]}
          >
            <Input placeholder="SUMMER10" style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="usage_limit">
            <InputNumber placeholder="Usage limit" min={1} style={{ width: 140 }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add code
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </Edit>
  );
};
