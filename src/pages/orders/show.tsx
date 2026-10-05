import { Show } from "@refinedev/antd";
import { useList, useShow } from "@refinedev/core";
import { Card, Descriptions, Divider, Table, Tag, Typography } from "antd";

const { Title } = Typography;

type Order = {
  id: string;
  number: number;
  email: string;
  phone: string | null;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  currency: string;
  subtotal_amount: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  shipping_method_name: string | null;
  shipping_carrier_code: string | null;
  customer_note: string | null;
  placed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
};

type OrderLine = {
  id: string;
  sku: string;
  product_name: string;
  variant_label: string | null;
  quantity: number;
  unit_price_amount: number;
  subtotal_amount: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
};

type OrderAddress = {
  kind: string;
  first_name: string;
  last_name: string;
  company: string | null;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  postal_code: string;
  country_code: string;
};

type Payment = {
  id: string;
  provider: string;
  provider_payment_id: string;
  method_type: string | null;
  status: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  card_brand: string | null;
  card_last4: string | null;
  failure_code: string | null;
  failure_message: string | null;
  created_at: string;
};

export const OrderShow = () => {
  const { query, result: order } = useShow<Order>();
  const orderId = order?.id;

  const formatAmount = (minorUnits: number) =>
    order ? new Intl.NumberFormat("pl-PL", { style: "currency", currency: order.currency }).format(minorUnits / 100) : minorUnits;

  const { result: linesResult } = useList<OrderLine>({
    resource: "order_lines",
    filters: orderId ? [{ field: "order_id", operator: "eq", value: orderId }] : [],
    queryOptions: { enabled: !!orderId },
    pagination: { pageSize: 50 },
  });
  const { result: addressesResult } = useList<OrderAddress>({
    resource: "order_addresses",
    filters: orderId ? [{ field: "order_id", operator: "eq", value: orderId }] : [],
    queryOptions: { enabled: !!orderId },
    pagination: { pageSize: 10 },
  });
  const { result: paymentsResult } = useList<Payment>({
    resource: "payments",
    filters: orderId ? [{ field: "order_id", operator: "eq", value: orderId }] : [],
    queryOptions: { enabled: !!orderId },
    pagination: { pageSize: 10 },
  });

  const paymentStatusColor: Record<string, string> = {
    pending: "default", requires_action: "gold", processing: "blue",
    authorized: "blue", succeeded: "green", failed: "red", canceled: "default",
  };

  return (
    <Show isLoading={query?.isLoading} title={order ? `Order #${order.number}` : "Order"}>
      {order && (
        <>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Email">{order.email}</Descriptions.Item>
            <Descriptions.Item label="Phone">{order.phone ?? "--"}</Descriptions.Item>
            <Descriptions.Item label="Status"><Tag>{order.status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Payment status"><Tag>{order.payment_status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Fulfillment"><Tag>{order.fulfillment_status}</Tag></Descriptions.Item>
            <Descriptions.Item label="Shipping method">
              {order.shipping_method_name ?? "--"} {order.shipping_carrier_code ? `(${order.shipping_carrier_code})` : ""}
            </Descriptions.Item>
            <Descriptions.Item label="Placed at">{order.placed_at ? new Date(order.placed_at).toLocaleString() : "--"}</Descriptions.Item>
            <Descriptions.Item label="Completed at">{order.completed_at ? new Date(order.completed_at).toLocaleString() : "--"}</Descriptions.Item>
            {order.cancelled_at && (
              <Descriptions.Item label="Cancelled" span={2}>
                {new Date(order.cancelled_at).toLocaleString()} -- {order.cancel_reason ?? "no reason recorded"}
              </Descriptions.Item>
            )}
            {order.customer_note && (
              <Descriptions.Item label="Customer note" span={2}>{order.customer_note}</Descriptions.Item>
            )}
          </Descriptions>

          <Divider />
          <Title level={5}>Items</Title>
          <Table
            dataSource={linesResult?.data ?? []}
            rowKey="id"
            pagination={false}
            size="small"
            summary={() => (
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} />
                <Table.Summary.Cell index={1}><strong>Subtotal</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2}><strong>{formatAmount(order.subtotal_amount)}</strong></Table.Summary.Cell>
              </Table.Summary.Row>
            )}
          >
            <Table.Column dataIndex="sku" title="SKU" />
            <Table.Column dataIndex="product_name" title="Product" />
            <Table.Column dataIndex="quantity" title="Qty" />
            <Table.Column dataIndex="unit_price_amount" title="Unit price" render={formatAmount} />
            <Table.Column dataIndex="subtotal_amount" title="Line total" render={formatAmount} />
          </Table>

          <Descriptions bordered column={1} size="small" style={{ marginTop: 16, maxWidth: 400, marginLeft: "auto" }}>
            <Descriptions.Item label="Discount">{formatAmount(order.discount_amount)}</Descriptions.Item>
            <Descriptions.Item label="Shipping">{formatAmount(order.shipping_amount)}</Descriptions.Item>
            <Descriptions.Item label="Tax">{formatAmount(order.tax_amount)}</Descriptions.Item>
            <Descriptions.Item label="Total"><strong>{formatAmount(order.total_amount)}</strong></Descriptions.Item>
          </Descriptions>

          <Divider />
          <Title level={5}>Addresses</Title>
          <div style={{ display: "flex", gap: 16 }}>
            {(addressesResult?.data ?? []).map((addr) => (
              <Card key={addr.kind} title={addr.kind} size="small" style={{ flex: 1 }}>
                <div>{addr.first_name} {addr.last_name}</div>
                {addr.company && <div>{addr.company}</div>}
                <div>{addr.line1}</div>
                {addr.line2 && <div>{addr.line2}</div>}
                <div>{addr.postal_code} {addr.city}</div>
                <div>{addr.country_code}</div>
              </Card>
            ))}
          </div>

          <Divider />
          <Title level={5}>Payments</Title>
          {(paymentsResult?.data ?? []).length === 0 ? (
            <Typography.Text type="secondary">No payment recorded yet -- awaiting payment.</Typography.Text>
          ) : (
            <Table dataSource={paymentsResult?.data ?? []} rowKey="id" pagination={false} size="small">
              <Table.Column dataIndex="provider" title="Provider" />
              <Table.Column dataIndex="method_type" title="Method" />
              <Table.Column
                dataIndex="status"
                title="Status"
                render={(v: string) => <Tag color={paymentStatusColor[v]}>{v}</Tag>}
              />
              <Table.Column dataIndex="amount" title="Amount" render={formatAmount} />
              <Table.Column
                title="Card"
                render={(_, p: Payment) => (p.card_brand ? `${p.card_brand} ***${p.card_last4}` : "--")}
              />
              <Table.Column
                title="Failure"
                render={(_, p: Payment) => p.failure_message ?? "--"}
              />
            </Table>
          )}
        </>
      )}
    </Show>
  );
};
