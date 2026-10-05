import { useCustom, useCustomMutation, useList } from "@refinedev/core";
import { Button, Card, Form, Input, Tabs, message } from "antd";
import { useEffect } from "react";
import { API_URL } from "../providers/constants";

type Field = { name: string; label: string; type?: "text" | "textarea"; required?: boolean };
type Locale = { code: string; name: string; is_active: boolean | null };
type TranslationRow = Record<string, unknown> & { locale: string };

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
  fields: Field[];
}) => {
  const { result: localesResult } = useList<Locale>({
    resource: "locales",
    filters: [{ field: "is_active", operator: "eq", value: true }],
    pagination: { pageSize: 50 },
  });
  const { result: translationsResult, query: translationsQuery } = useCustom<TranslationRow[]>({
    url: `${API_URL}/${resourcePath}/${itemId}/translations`,
    method: "get",
    queryOptions: { enabled: !!itemId },
  });
  const { mutate, mutation } = useCustomMutation();
  const [form] = Form.useForm();

  const locales = localesResult?.data ?? [];
  const fieldKey = (locale: string, field: string) => `${locale}__${field}`;

  // Every *_translations table has the same `slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`
  // check constraint (products, categories, collections, attributes, ...) --
  // normalize here, once, instead of trusting raw admin input and surfacing a
  // raw Postgres constraint-violation error.
  const slugify = (value: unknown): unknown => {
    if (typeof value !== "string") return value;
    return value
      .toLowerCase()
      .trim()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  useEffect(() => {
    if (!Array.isArray(translationsResult?.data)) return;
    const initial: Record<string, unknown> = {};
    for (const row of translationsResult.data) {
      for (const f of fields) {
        initial[fieldKey(row.locale, f.name)] = row[f.name];
      }
    }
    form.setFieldsValue(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationsResult, form]);

  const onFinish = (values: Record<string, unknown>) => {
    const payload = locales.map((l) => {
      const row: Record<string, unknown> = { locale: l.code };
      for (const f of fields) {
        const raw = values[fieldKey(l.code, f.name)];
        row[f.name] = f.name === "slug" ? slugify(raw) : raw;
      }
      return row;
    });
    mutate(
      {
        url: `${API_URL}/${resourcePath}/${itemId}/translations`,
        method: "put",
        values: payload,
        config: { headers: { "Content-Type": "application/json" } },
      },
      {
        onSuccess: () => {
          message.success("Translations saved");
          translationsQuery.refetch();
        },
        onError: (error: any) => message.error(error?.message ?? "Failed to save translations"),
      },
    );
  };

  if (!itemId || locales.length === 0) return null;

  return (
    <Card title="Translations">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Tabs
          items={locales.map((l) => ({
            key: l.code,
            label: l.name,
            children: fields.map((f) => (
              <Form.Item
                key={f.name}
                label={f.label}
                name={fieldKey(l.code, f.name)}
                rules={f.required ? [{ required: true }] : []}
              >
                {f.type === "textarea" ? <Input.TextArea rows={3} /> : <Input />}
              </Form.Item>
            )),
          }))}
        />
        <Button type="primary" htmlType="submit" loading={mutation.isPending}>
          Save translations
        </Button>
      </Form>
    </Card>
  );
};
