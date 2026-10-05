import { EditButton, List, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";

const STATUS_COLOR: Record<string, string> = {
  active: "green",
  disabled: "red",
  anonymized: "default",
};

export const CustomerList = () => {
  const { tableProps } = useTable({ syncWithLocation: true, sorters: { initial: [{ field: "created_at", order: "desc" }] } });

  return (
    <List canCreate={false}>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="email" title="Email" />
        <Table.Column
          title="Name"
          render={(_, r: BaseRecord) =>
            [r.first_name, r.last_name].filter(Boolean).join(" ") || <i>--</i>
          }
        />
        <Table.Column dataIndex="phone" title="Phone" render={(v: string | null) => v ?? "--"} />
        <Table.Column dataIndex="locale" title="Locale" />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(v: string) => <Tag color={STATUS_COLOR[v]}>{v}</Tag>}
        />
        <Table.Column
          dataIndex="created_at"
          title="Signed up"
          render={(v: string) => new Date(v).toLocaleDateString()}
        />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
