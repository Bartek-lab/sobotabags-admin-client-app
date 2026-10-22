import { Button, Card, Form, Input, Tabs } from "antd";
import { useTranslations, translationFieldKey, type TranslationField } from "../hooks/use-translations";

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

  return (
    <Card title="Translations">
      <Form form={form} layout="vertical" onFinish={save}>
        <Tabs
          items={locales.map((l) => ({
            key: l.code,
            label: l.name,
            children: fields.map((f) => (
              <Form.Item
                key={f.name}
                label={f.label}
                name={translationFieldKey(l.code, f.name)}
                rules={f.required ? [{ required: true }] : []}
              >
                {f.type === "textarea" ? <Input.TextArea rows={3} /> : <Input />}
              </Form.Item>
            )),
          }))}
        />
        <Button type="primary" htmlType="submit" loading={saving}>
          Save translations
        </Button>
      </Form>
    </Card>
  );
};
