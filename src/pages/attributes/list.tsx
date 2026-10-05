import { DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";

export const AttributeList = () => {
  const { tableProps } = useTable({ syncWithLocation: true });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="code" title="Code" />
        <Table.Column dataIndex="data_type" title="Type" render={(v) => <Tag>{v}</Tag>} />
        <Table.Column
          dataIndex="is_filterable"
          title="Filterable"
          render={(v: boolean) => (v ? <Tag color="blue">facet</Tag> : null)}
        />
        <Table.Column dataIndex="sort_order" title="Sort" />
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
