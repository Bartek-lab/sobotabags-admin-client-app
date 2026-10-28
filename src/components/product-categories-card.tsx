import { useCustom } from "@refinedev/core";
import { Button, Card, Checkbox, Radio, Space, Spin, Tag, Typography } from "antd";
import { categoriesWithNamesUrl, type CategoryWithName as Category } from "../api/categories";
import { useProductCategories } from "../hooks/use-product-categories";

const { Text } = Typography;

export const ProductCategoriesCard = ({ productId }: { productId?: string }) => {
  const { result, query } = useCustom<Category[]>({
    url: categoriesWithNamesUrl(),
    method: "get",
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
      {query.isLoading ? (
        <Spin />
      ) : categories.length === 0 ? (
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
              const parentLabel = parent ? (parent.name ?? parent.code) : null;
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Checkbox checked={checked} onChange={(e) => toggle(c.id, e.target.checked)} />
                  <span>
                    {parentLabel ? `${parentLabel} / ` : ""}
                    {c.name ?? c.code}
                    {c.is_active === false ? <Text type="secondary"> (inactive)</Text> : null}
                  </span>
                  {c.name === null && (
                    <Tag color="warning" title="Add a translation on this category's edit screen -- it won't show on the storefront until it has one.">
                      no translation yet
                    </Tag>
                  )}
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
