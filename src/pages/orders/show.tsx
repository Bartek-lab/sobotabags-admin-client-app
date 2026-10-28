import { Show } from "@refinedev/antd";
import { useCustomMutation, useList, useShow, useUpdate } from "@refinedev/core";
import {
  Button,
  Card,
  Checkbox,
  Descriptions,
  Divider,
  Input,
  InputNumber,
  message,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { API_URL } from "../../providers/constants";

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
  pickup_point: {
    point_name: string;
    point_address: string | null;
    first_name: string;
    last_name: string;
    phone: string | null;
  } | null;
  customer_note: string | null;
  placed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  shipped_at: string | null;
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

type OrderWithdrawal = {
  id: string;
  order_id: string;
  reason: string | null;
  status: string;
  admin_note: string | null;
  requested_at: string;
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

type Refund = {
  id: string;
  payment_id: string;
  provider_refund_id: string | null;
  status: string;
  amount: number;
  reason: string | null;
  restocked: boolean;
  created_at: string;
};

const refundStatusColor: Record<string, string> = {
  pending: "gold", succeeded: "green", failed: "red", canceled: "default",
};

// Calls POST /orders/{id}/refund (app/routers/refunds.py) -- can't be
// generic CRUD since it calls Stripe and touches payments/orders/
// product_variants/order_withdrawals together. See
// admin-api/app/services/refund_service.py for the full orchestration.
const RefundCard = ({
  orderId,
  payment,
  lines,
  refunds,
  formatAmount,
  onIssued,
}: {
  orderId: string;
  payment: Payment;
  lines: OrderLine[];
  refunds: Refund[];
  formatAmount: (minorUnits: number) => string | number;
  onIssued: () => void;
}) => {
  const refundable = payment.amount_captured - payment.amount_refunded;
  const [amount, setAmount] = useState<number>(refundable / 100);
  const [reason, setReason] = useState("");
  const [restockLineIds, setRestockLineIds] = useState<string[]>([]);
  const { mutate, mutation } = useCustomMutation();

  const toggleRestock = (lineId: string, checked: boolean) => {
    setRestockLineIds((prev) => (checked ? [...prev, lineId] : prev.filter((id) => id !== lineId)));
  };

  const submit = () => {
    mutate(
      {
        url: `${API_URL}/orders/${orderId}/refund`,
        method: "post",
        values: {
          amount: Math.round(amount * 100),
          reason: reason || undefined,
          restock_order_line_ids: restockLineIds,
        },
        config: { headers: { "Content-Type": "application/json" } },
      },
      {
        onSuccess: () => {
          setReason("");
          setRestockLineIds([]);
          onIssued();
        },
      },
    );
  };

  return (
    <Card title="Zwrot środków" size="small" style={{ marginTop: 16 }}>
      {refunds.length > 0 && (
        <Table
          dataSource={refunds}
          rowKey="id"
          pagination={false}
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Table.Column dataIndex="amount" title="Kwota" render={formatAmount} />
          <Table.Column
            dataIndex="status"
            title="Status"
            render={(v: string) => <Tag color={refundStatusColor[v]}>{v}</Tag>}
          />
          <Table.Column dataIndex="reason" title="Powód" render={(v: string | null) => v ?? "--"} />
          <Table.Column
            dataIndex="restocked"
            title="Dotowarowano"
            render={(v: boolean) => (v ? "tak" : "nie")}
          />
          <Table.Column
            dataIndex="created_at"
            title="Data"
            render={(v: string) => new Date(v).toLocaleString()}
          />
        </Table>
      )}

      {refundable <= 0 ? (
        <Typography.Text type="secondary">Płatność została już w pełni zwrócona.</Typography.Text>
      ) : (
        <>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Dostępne do zwrotu">{formatAmount(refundable)}</Descriptions.Item>
            <Descriptions.Item label="Kwota zwrotu">
              <InputNumber
                min={0.01}
                max={refundable / 100}
                step={1}
                value={amount}
                onChange={(v) => setAmount(v ?? 0)}
                style={{ width: 160 }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Powód (opcjonalnie)">
              <Input.TextArea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Descriptions.Item>
            <Descriptions.Item label="Dotowarować (przywrócić stan magazynowy)">
              {lines.map((line) => (
                <div key={line.id}>
                  <Checkbox
                    checked={restockLineIds.includes(line.id)}
                    onChange={(e) => toggleRestock(line.id, e.target.checked)}
                  >
                    {line.product_name} {line.variant_label ? `(${line.variant_label})` : ""} ×{" "}
                    {line.quantity}
                  </Checkbox>
                </div>
              ))}
            </Descriptions.Item>
          </Descriptions>
          <Button
            type="primary"
            danger
            style={{ marginTop: 12 }}
            loading={mutation.isPending}
            onClick={submit}
          >
            Wystaw zwrot przez Stripe
          </Button>
        </>
      )}
    </Card>
  );
};

// Deliberately simple -- no separate shipments table, no carrier API. The
// admin ships however they actually do it (InPost's own app, a Poczta
// Polska counter) and records the result here; this calls POST
// /orders/{id}/ship, which updates the order and fires the
// shipment-confirmation email in one action. See
// admin-api/app/services/shipment_service.py.
export const ShipmentCard = ({ order, onShipped }: { order: Order; onShipped: () => void }) => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const { mutate, mutation } = useCustomMutation();

  const submit = () => {
    mutate(
      {
        url: `${API_URL}/orders/${order.id}/ship`,
        method: "post",
        values: { tracking_number: trackingNumber, tracking_url: trackingUrl || undefined },
        config: { headers: { "Content-Type": "application/json" } },
      },
      {
        onSuccess: (data) => {
          const emailSent = (data?.data as { email_sent?: boolean } | undefined)?.email_sent;
          if (emailSent === false) {
            message.warning(
              "Zamówienie oznaczone jako wysłane, ale e-mail do klienta nie poszedł (np. limit trybu testowego Resend) -- poinformuj klienta ręcznie.",
            );
          } else {
            message.success("Zamówienie oznaczone jako wysłane, e-mail wysłany.");
          }
          onShipped();
        },
      },
    );
  };

  if (order.fulfillment_status === "fulfilled") {
    return (
      <Card title="Wysyłka" size="small" style={{ marginTop: 16 }}>
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Wysłano">
            {order.shipped_at ? new Date(order.shipped_at).toLocaleString() : "--"}
          </Descriptions.Item>
          <Descriptions.Item label="Numer przesyłki">{order.tracking_number ?? "--"}</Descriptions.Item>
          {order.tracking_url && (
            <Descriptions.Item label="Śledzenie">
              <a href={order.tracking_url} target="_blank" rel="noreferrer">
                {order.tracking_url}
              </a>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    );
  }

  return (
    <Card title="Oznacz jako wysłane" size="small" style={{ marginTop: 16 }}>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Numer przesyłki">
          <Input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="np. KAXI01BAPP lub numer listu przewozowego"
          />
        </Descriptions.Item>
        <Descriptions.Item label="Link do śledzenia (opcjonalnie)">
          <Input value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://..." />
        </Descriptions.Item>
      </Descriptions>
      <Button
        type="primary"
        style={{ marginTop: 12 }}
        disabled={!trackingNumber}
        loading={mutation.isPending}
        onClick={submit}
      >
        Oznacz jako wysłane i wyślij e-mail do klienta
      </Button>
    </Card>
  );
};

// The customer-facing "odstąp od umowy" button (shop-client) inserts the row
// this card edits -- no create/delete here, only status/admin_note, matching
// order_withdrawals' allow_create=False/allow_delete=False in admin-api.
const WithdrawalCard = ({ withdrawal, onSaved }: { withdrawal: OrderWithdrawal; onSaved: () => void }) => {
  const [status, setStatus] = useState(withdrawal.status);
  const [adminNote, setAdminNote] = useState(withdrawal.admin_note ?? "");
  const { mutate, mutation } = useUpdate();

  useEffect(() => {
    setStatus(withdrawal.status);
    setAdminNote(withdrawal.admin_note ?? "");
  }, [withdrawal.status, withdrawal.admin_note]);

  const save = () => {
    mutate(
      { resource: "order_withdrawals", id: withdrawal.id, values: { status, admin_note: adminNote || null } },
      { onSuccess: onSaved },
    );
  };

  return (
    <Card title="Odstąpienie od umowy" size="small" style={{ marginTop: 16, borderColor: "#faad14" }}>
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Zgłoszono">
          {new Date(withdrawal.requested_at).toLocaleString()}
        </Descriptions.Item>
        <Descriptions.Item label="Powód (opcjonalnie podany)">
          {withdrawal.reason ?? "-- nie podano --"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          <Select
            value={status}
            onChange={setStatus}
            style={{ width: 200 }}
            options={[
              { label: "Zgłoszone", value: "submitted" },
              { label: "Przyjęte do realizacji", value: "acknowledged" },
              { label: "Zwrócono środki", value: "refunded" },
              { label: "Odrzucone", value: "rejected" },
            ]}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Notatka wewnętrzna">
          <Input.TextArea
            rows={2}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="np. zwrot nadany 10.10, towar sprawdzony, saldo zwrócone przez Stripe"
          />
        </Descriptions.Item>
      </Descriptions>
      <Button type="primary" style={{ marginTop: 12 }} loading={mutation.isPending} onClick={save}>
        Zapisz
      </Button>
    </Card>
  );
};

export const OrderShow = () => {
  const { query, result: order } = useShow<Order>();
  const orderId = order?.id;

  const formatAmount = (minorUnits: number) =>
    order ? new Intl.NumberFormat("pl-PL", { style: "currency", currency: order.currency }).format(minorUnits / 100) : minorUnits;

  const { result: linesResult, query: linesQuery } = useList<OrderLine>({
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
  const { result: paymentsResult, query: paymentsQuery } = useList<Payment>({
    resource: "payments",
    filters: orderId ? [{ field: "order_id", operator: "eq", value: orderId }] : [],
    queryOptions: { enabled: !!orderId },
    pagination: { pageSize: 10 },
  });
  const succeededPayment = (paymentsResult?.data ?? []).find((p) => p.status === "succeeded");
  const { result: refundsResult, query: refundsQuery } = useList<Refund>({
    resource: "refunds",
    filters: succeededPayment ? [{ field: "payment_id", operator: "eq", value: succeededPayment.id }] : [],
    queryOptions: { enabled: !!succeededPayment },
    pagination: { pageSize: 20 },
  });
  const { result: withdrawalsResult, query: withdrawalsQuery } = useList<OrderWithdrawal>({
    resource: "order_withdrawals",
    filters: orderId ? [{ field: "order_id", operator: "eq", value: orderId }] : [],
    queryOptions: { enabled: !!orderId },
    pagination: { pageSize: 1 },
  });
  const withdrawal = withdrawalsResult?.data?.[0];

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

          <ShipmentCard order={order} onShipped={() => query?.refetch()} />

          {withdrawal && <WithdrawalCard withdrawal={withdrawal} onSaved={() => withdrawalsQuery.refetch()} />}

          <Divider />
          <Title level={5}>Items</Title>
          <Table
            dataSource={linesResult?.data ?? []}
            rowKey="id"
            pagination={false}
            size="small"
            loading={linesQuery.isLoading}
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
          {order.pickup_point ? (
            // Pickup-point orders (InPost locker) have zero order_addresses
            // rows -- there's no street address, just this blob, captured at
            // checkout from the Furgonetka map widget.
            <Card title="pickup point" size="small" style={{ maxWidth: 400 }}>
              <div><strong>{order.pickup_point.point_name}</strong></div>
              {order.pickup_point.point_address && <div>{order.pickup_point.point_address}</div>}
              <div>Odbiorca: {order.pickup_point.first_name} {order.pickup_point.last_name}</div>
              {order.pickup_point.phone && <div>Tel: {order.pickup_point.phone}</div>}
            </Card>
          ) : (
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
          )}

          <Divider />
          <Title level={5}>Payments</Title>
          {(paymentsResult?.data ?? []).length === 0 ? (
            <Typography.Text type="secondary">No payment recorded yet -- awaiting payment.</Typography.Text>
          ) : (
            <Table
              dataSource={paymentsResult?.data ?? []}
              rowKey="id"
              pagination={false}
              size="small"
              loading={paymentsQuery.isLoading}
            >
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

          {succeededPayment && (
            <RefundCard
              orderId={order.id}
              payment={succeededPayment}
              lines={linesResult?.data ?? []}
              refunds={refundsResult?.data ?? []}
              formatAmount={formatAmount}
              onIssued={() => {
                paymentsQuery.refetch();
                refundsQuery.refetch();
              }}
            />
          )}
        </>
      )}
    </Show>
  );
};
