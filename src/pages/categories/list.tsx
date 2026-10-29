import { useCustom } from "@refinedev/core";
import { DeleteButton, EditButton, List } from "@refinedev/antd";
import { Card, Space, Table, Tag, Typography } from "antd";
import { categoriesWithNamesUrl, type CategoryWithName as Category } from "../../api/categories";

const { Text } = Typography;

const nameCell = (c: Category) => (
  <Space>
    <span>{c.name ?? c.code}</span>
    {c.name === null && (
      <Tag
        color="warning"
        title="Add a translation on this category's edit screen -- it won't show on the storefront until it has one."
      >
        no translation yet
      </Tag>
    )}
  </Space>
);

const activeCell = (v: boolean) => (v ? <Tag color="green">active</Tag> : <Tag>inactive</Tag>);

const actionsCell = (c: Category) => (
  <Space>
    <EditButton hideText size="small" resource="categories" recordItemId={c.id} />
    <DeleteButton hideText size="small" resource="categories" recordItemId={c.id} />
  </Space>
);

export const CategoryList = () => {
  const { result, query } = useCustom<Category[]>({ url: categoriesWithNamesUrl(), method: "get" });
  const categories = Array.isArray(result?.data) ? result.data : [];
  const byId = new Map(categories.map((c) => [c.id, c]));

  const parentCategories = categories.filter((c) => !c.parent_id);
  const childCategories = categories.filter((c) => c.parent_id);

  return (
    <List>
      <Card title="Parent categories" style={{ marginBottom: 16 }}>
        <Table
          dataSource={parentCategories}
          rowKey="id"
          loading={query.isLoading}
          pagination={false}
          size="small"
        >
          <Table.Column title="Name" render={(_, c: Category) => nameCell(c)} />
          <Table.Column dataIndex="code" title="Code" />
          <Table.Column dataIndex="sort_order" title="Sort" />
          <Table.Column dataIndex="is_active" title="Active" render={activeCell} />
          <Table.Column title="Actions" render={(_, c: Category) => actionsCell(c)} />
        </Table>
      </Card>

      <Card
        title="Child categories"
        extra={
          <Text type="secondary">
            A child only shows on the storefront within its own parent's section -- see the Admin guide for why.
          </Text>
        }
      >
        <Table
          dataSource={childCategories}
          rowKey="id"
          loading={query.isLoading}
          pagination={false}
          size="small"
        >
          <Table.Column title="Name" render={(_, c: Category) => nameCell(c)} />
          <Table.Column
            title="Parent"
            render={(_, c: Category) => {
              const parent = c.parent_id ? byId.get(c.parent_id) : undefined;
              return parent ? (parent.name ?? parent.code) : <Text type="secondary">--</Text>;
            }}
          />
          <Table.Column dataIndex="code" title="Code" />
          <Table.Column dataIndex="sort_order" title="Sort" />
          <Table.Column dataIndex="is_active" title="Active" render={activeCell} />
          <Table.Column title="Actions" render={(_, c: Category) => actionsCell(c)} />
        </Table>
      </Card>
    </List>
  );
};
