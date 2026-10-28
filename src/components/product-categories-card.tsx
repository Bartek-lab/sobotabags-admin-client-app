import { useList } from "@refinedev/core";
import { Button, Card, Checkbox, Radio, Space, Typography } from "antd";
import { useProductCategories } from "../hooks/use-product-categories";

const { Text } = Typography;

type Category = { id: string; code: string; parent_id: string | null; is_active: boolean | null };

export const ProductCategoriesCard = ({ productId }: { productId?: string }) => {
  const { result } = useList<Category>({
    resource: "categories",
    pagination: { pageSize: 200 },
    sorters: [{ field: "code", order: "asc" }],
  });
  const { categoryIds, setCategoryIds, primaryId, setPrimaryId, save, saving } =
    useProductCategories(productId);

  if (!productId) return null;

  const categories = result?.data ?? [];
  const byId = new Map(categories.map((c) => [c.id, c]));

  const toggle = (id: string, checked: boolean) => {
    const next = checked ? [...categoryIds, id] : categoryIds.filter((c) => c !== id);
    setCategoryIds(next);
    if (!checked && primaryId === id) {
      setPrimaryId(next[0] ?? null);
    }
  };

  return (
    <Card
      title="Categories"
      extra={<Text type="secondary">Pick which categories this product appears in; one can be primary.</Text>}
    >
      {categories.length === 0 ? (
        <Text type="secondary">No categories defined yet -- create one under Categories first.</Text>
      ) : (
        <Space direction="vertical">
          <Radio.Group
            value={primaryId}
            onChange={(e) => setPrimaryId(e.target.value)}
            style={{ width: "100%" }}
          >
            {categories.map((c) => {
              const parent = c.parent_id ? byId.get(c.parent_id) : undefined;
              const checked = categoryIds.includes(c.id);
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Checkbox checked={checked} onChange={(e) => toggle(c.id, e.target.checked)} />
                  <span>
                    {parent ? `${parent.code} / ` : ""}
                    {c.code}
                    {c.is_active === false ? <Text type="secondary"> (inactive)</Text> : null}
                  </span>
                  <Radio value={c.id} disabled={!checked}>
                    primary
                  </Radio>
                </div>
              );
            })}
          </Radio.Group>
          <Button type="primary" onClick={save} loading={saving} style={{ marginTop: 8 }}>
            Save categories
          </Button>
        </Space>
      )}
    </Card>
  );
};
