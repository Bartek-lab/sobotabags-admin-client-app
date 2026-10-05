import { DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";

export const ShippingMethodList = () => {
  const { tableProps } = useTable({ syncWithLocation: true });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="code" title="Code" />
        <Table.Column dataIndex="carrier_code" title="Carrier" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column
          dataIndex="requires_pickup_point"
          title="Pickup point"
          render={(v: boolean) => (v ? <Tag color="blue">locker</Tag> : "address")}
        />
        <Table.Column
          dataIndex="price_amount"
          title="Price"
          render={(v: number) => (v / 100).toFixed(2)}
        />
        <Table.Column
          dataIndex="free_above_amount"
          title="Free above"
          render={(v: number | null) => (v != null ? (v / 100).toFixed(2) : "--")}
        />
        <Table.Column
          dataIndex="is_active"
          title="Active"
          render={(v: boolean) => (v ? <Tag color="green">active</Tag> : <Tag>inactive</Tag>)}
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
