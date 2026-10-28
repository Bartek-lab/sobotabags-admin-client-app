import { DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import { useList, type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Typography } from "antd";

const { Text } = Typography;

type PromotionCodeRow = { id: string; promotion_id: string; code: string; is_active: boolean | null };

export const PromotionList = () => {
  const { tableProps } = useTable({ syncWithLocation: true });

  // All promo codes, grouped by promotion -- the "Code" column below is the
  // *internal* identifier (promotions.code), not what a customer actually
  // types at checkout (promotion_codes.code, a separate one-to-many table).
  // That mix-up is exactly what caused a promo to look "broken" earlier --
  // a promotion with no redeemable code added yet can never be found at
  // checkout, and there was previously no way to see that from this list.
  const { result: codesResult } = useList<PromotionCodeRow>({
    resource: "promotion_codes",
    pagination: { pageSize: 500 },
  });
  const codesByPromotion = new Map<string, PromotionCodeRow[]>();
  for (const c of codesResult?.data ?? []) {
    codesByPromotion.set(c.promotion_id, [...(codesByPromotion.get(c.promotion_id) ?? []), c]);
  }

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="code" title="Internal code" />
        <Table.Column dataIndex="name" title="Name" />
        <Table.Column
          title="Checkout codes"
          render={(_, record: BaseRecord) => {
            const codes = codesByPromotion.get(record.id as string) ?? [];
            if (codes.length === 0) {
              return (
                <Text type="warning">no code yet -- can&apos;t be redeemed at checkout</Text>
              );
            }
            return (
              <Space size={4} wrap>
                {codes.map((c) => (
                  <Tag key={c.id} color={c.is_active === false ? "default" : "blue"}>
                    {c.code}
                    {c.is_active === false ? " (inactive)" : ""}
                  </Tag>
                ))}
              </Space>
            );
          }}
        />
        <Table.Column dataIndex="type" title="Type" render={(v) => <Tag>{v}</Tag>} />
        <Table.Column dataIndex="percentage" title="%" />
        <Table.Column
          dataIndex="is_active"
          title="Active"
          render={(v: boolean) => (v ? <Tag color="green">active</Tag> : <Tag>inactive</Tag>)}
        />
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
