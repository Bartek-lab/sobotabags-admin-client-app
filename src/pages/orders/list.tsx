import { List, ShowButton, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";

const statusColor: Record<string, string> = {
  draft: "default",
  pending: "gold",
  placed: "blue",
  completed: "green",
  cancelled: "red",
};

const paymentColor: Record<string, string> = {
  unpaid: "default",
  authorized: "blue",
  partially_paid: "gold",
  paid: "green",
  partially_refunded: "orange",
  refunded: "red",
};

const formatAmount = (minorUnits: number, currency: string) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency }).format(minorUnits / 100);

export const OrderList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
    sorters: { initial: [{ field: "created_at", order: "desc" }] },
  });

  return (
    <List title="Orders">
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="number" title="Order #" />
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(v: string, r: BaseRecord) => (
            <Space direction="vertical" size={0}>
              <Tag color={statusColor[v]}>{v}</Tag>
              {v === "cancelled" && r.cancel_reason === "consumer_withdrawal" && (
                <Tag color="volcano">odstąpienie od umowy</Tag>
              )}
            </Space>
          )}
        />
        <Table.Column
          dataIndex="payment_status"
          title="Payment"
          render={(v: string) => <Tag color={paymentColor[v]}>{v}</Tag>}
        />
        <Table.Column
          title="Total"
          render={(_, r: BaseRecord) => formatAmount(r.total_amount, r.currency)}
        />
        <Table.Column
          dataIndex="created_at"
          title="Created"
          render={(v: string) => new Date(v).toLocaleString()}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
