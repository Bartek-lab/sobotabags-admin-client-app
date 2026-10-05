import { DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Typography } from "antd";

const { Text } = Typography;

export const ProductList = () => {
  const { tableProps } = useTable({ syncWithLocation: true });

  const statusColor: Record<string, string> = {
    draft: "default",
    active: "green",
    archived: "red",
  };

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="name"
          title="Name"
          render={(v: string | null, record: BaseRecord) =>
            v ?? <Text type="secondary">(no translation yet -- id {String(record.id).slice(0, 8)})</Text>
          }
        />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(v: string) => <Tag color={statusColor[v]}>{v}</Tag>}
        />
        <Table.Column dataIndex="published_at" title="Published" />
        <Table.Column
          title="Actions"
          dataIndex="actions"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
