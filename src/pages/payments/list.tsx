import { List, useTable } from "@refinedev/antd";
import { useNavigation, type BaseRecord } from "@refinedev/core";
import { Button, Table, Tag, Typography } from "antd";

const { Text } = Typography;

const statusColor: Record<string, string> = {
  pending: "default",
  requires_action: "gold",
  processing: "blue",
  authorized: "blue",
  succeeded: "green",
  failed: "red",
  canceled: "default",
};

const formatAmount = (minorUnits: number, currency: string) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency }).format(minorUnits / 100);

export const PaymentList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
  });
  const { show } = useNavigation();

  return (
    <List title="Payments (display-only -- mock data)">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="provider" title="Provider" />
        <Table.Column dataIndex="method_type" title="Method" />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(v: string) => <Tag color={statusColor[v]}>{v}</Tag>}
        />
        <Table.Column
          title="Amount"
          render={(_, r: BaseRecord) => formatAmount(r.amount, r.currency)}
        />
        <Table.Column
          title="Card"
          render={(_, r: BaseRecord) => (r.card_brand ? `${r.card_brand} ***${r.card_last4}` : "--")}
        />
        <Table.Column
          title="Failure"
          render={(_, r: BaseRecord) =>
            r.failure_message ? <Text type="danger">{r.failure_message}</Text> : "--"
          }
        />
        <Table.Column
          title="Order"
          render={(_, r: BaseRecord) => (
            <Button size="small" onClick={() => show("orders", r.order_id)}>
              View order
            </Button>
          )}
        />
      </Table>
    </List>
  );
};
