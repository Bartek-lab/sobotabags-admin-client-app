import { CreateButton, DeleteButton, EditButton, List, useTable } from "@refinedev/antd";
import type { BaseRecord } from "@refinedev/core";
import { useNavigate } from "react-router";
import { Space, Table, Tag } from "antd";

export const GiftCardList = () => {
  const { tableProps } = useTable({ syncWithLocation: true });
  const navigate = useNavigate();

  return (
    <List
      headerButtons={() => (
        // Deliberately NOT <CreateButton> -- issuing a funded card is a
        // two-table transaction (gift_cards + an 'issued' ledger row), not a
        // single generic POST /gift_cards. Routes to its own page that calls
        // POST /gift-cards/issue instead.
        <CreateButton onClick={() => navigate("/gift-cards/issue")}>
          Issue gift card
        </CreateButton>
      )}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="code" title="Code" />
        <Table.Column dataIndex="currency" title="Currency" />
        <Table.Column
          dataIndex="initial_amount"
          title="Initial"
          render={(v: number) => (v / 100).toFixed(2)}
        />
        <Table.Column
          dataIndex="balance_amount"
          title="Balance"
          render={(v: number) => (v / 100).toFixed(2)}
        />
        <Table.Column dataIndex="status" title="Status" render={(v) => <Tag>{v}</Tag>} />
        <Table.Column dataIndex="recipient_email" title="Recipient" />
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
