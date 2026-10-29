import { Button, Card, Collapse, Form, Input, Tabs, Typography } from "antd";
import { useTranslations, translationFieldKey, type TranslationField } from "../hooks/use-translations";

const { Text } = Typography;

const renderField = (locale: string, f: TranslationField) => (
  <Form.Item
    key={f.name}
    label={f.label}
    name={translationFieldKey(locale, f.name)}
    rules={f.required ? [{ required: true }] : []}
  >
    {f.type === "textarea" ? <Input.TextArea rows={3} /> : <Input />}
  </Form.Item>
);

// Shared by every entity that has *_translations: products, categories,
// collections, attributes, attribute_options, attribute_groups all share
// the same (entity_id, locale) shape on the backend (app/core/translations.py)
// -- this is the one frontend piece that goes with it, instead of
// duplicating the same tabs-per-locale form on every edit page.
export const TranslationsCard = ({
  resourcePath,
  itemId,
  fields,
}: {
  resourcePath: string;
  itemId?: string;
  fields: TranslationField[];
}) => {
  const [form] = Form.useForm();
  const { locales, save, saving } = useTranslations(resourcePath, itemId, fields, form);

  if (!itemId || locales.length === 0) return null;

  const mainFields = fields.filter((f) => !f.seo);
  const seoFields = fields.filter((f) => f.seo);

  return (
    <Card title="Translations">
      <Form form={form} layout="vertical" onFinish={save}>
        <Tabs
          items={locales.map((l) => ({
            key: l.code,
            label: l.name,
            children: (
              <>
                {mainFields.map((f) => renderField(l.code, f))}
                {seoFields.length > 0 && (
                  <Collapse
                    bordered={false}
                    style={{ marginBottom: 16 }}
                    items={[
                      {
                        key: "seo",
                        label: "SEO (optional -- filled in automatically if left blank)",
                        children: seoFields.map((f) => renderField(l.code, f)),
                      },
                    ]}
                  />
                )}
              </>
            ),
          }))}
        />
        {seoFields.length > 0 && (
          <Text type="secondary" style={{ display: "block", marginBottom: 12 }}>
            Just Name/Slug/Description is enough -- SEO fields fill themselves in from those unless you override
            them.
          </Text>
        )}
        <Button type="primary" htmlType="submit" loading={saving}>
          Save translations
        </Button>
      </Form>
    </Card>
  );
};
