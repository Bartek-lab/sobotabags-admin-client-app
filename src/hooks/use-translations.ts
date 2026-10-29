import { useCustom, useCustomMutation, useList, type HttpError } from "@refinedev/core";
import { useEffect } from "react";
import { message, type FormInstance } from "antd";
import { slugify, translationsUrl, type TranslationRow } from "../api/translations";

type Locale = { code: string; name: string; is_active: boolean | null };
export type TranslationField = {
  name: string;
  label: string;
  type?: "text" | "textarea";
  required?: boolean;
  // Tucked into a collapsed "SEO (optional)" section instead of shown inline.
  seo?: boolean;
  // When this field is left blank, its value is derived from another
  // field's value on save (e.g. meta_title <- name) instead of staying
  // empty -- the admin never has to fill in SEO fields unless they want to
  // override the default.
  autoFillFrom?: string;
};

const META_DESCRIPTION_MAX_LENGTH = 160;

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function deriveAutoFillValue(field: TranslationField, sourceValue: unknown): unknown {
  if (typeof sourceValue !== "string" || !sourceValue) return sourceValue;
  const plain = stripHtml(sourceValue);
  if (field.name === "meta_description") return plain.slice(0, META_DESCRIPTION_MAX_LENGTH);
  return plain;
}

export function translationFieldKey(locale: string, field: string) {
  return `${locale}__${field}`;
}

export function useTranslations(
  resourcePath: string,
  itemId: string | undefined,
  fields: TranslationField[],
  form: FormInstance,
) {
  const { result: localesResult } = useList<Locale>({
    resource: "locales",
    filters: [{ field: "is_active", operator: "eq", value: true }],
    pagination: { pageSize: 50 },
  });
  const { result: translationsResult, query } = useCustom<TranslationRow[]>({
    url: translationsUrl(resourcePath, itemId ?? ""),
    method: "get",
    queryOptions: { enabled: !!itemId },
  });
  const { mutate, mutation } = useCustomMutation();

  const locales = localesResult?.data ?? [];

  useEffect(() => {
    if (!Array.isArray(translationsResult?.data)) return;
    const initial: Record<string, unknown> = {};
    for (const row of translationsResult.data) {
      for (const f of fields) {
        initial[translationFieldKey(row.locale, f.name)] = row[f.name];
      }
    }
    form.setFieldsValue(initial);
    // Depend on translationsResult.data (react-query's own memoized array),
    // not translationsResult itself -- useCustom wraps it in a brand-new
    // `{ data: ... }` object literal on every render, so depending on the
    // whole object fires this effect every render, an infinite loop
    // ("Maximum update depth exceeded").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationsResult?.data, form]);

  const save = (values: Record<string, unknown>) => {
    const payload = locales.map((l) => {
      const row: Record<string, unknown> = { locale: l.code };
      for (const f of fields) {
        const raw = values[translationFieldKey(l.code, f.name)];
        row[f.name] = f.name === "slug" ? slugify(raw) : raw;
      }
      // Second pass: fields left blank fall back to another field's value
      // (e.g. meta_title <- name) -- done after the first pass so the
      // source value is already in `row` regardless of field order.
      for (const f of fields) {
        if (!f.autoFillFrom || row[f.name]) continue;
        row[f.name] = deriveAutoFillValue(f, row[f.autoFillFrom]);
      }
      return row;
    });
    mutate(
      {
        url: translationsUrl(resourcePath, itemId ?? ""),
        method: "put",
        values: payload,
        config: { headers: { "Content-Type": "application/json" } },
      },
      {
        onSuccess: () => {
          message.success("Translations saved");
          query.refetch();
        },
        onError: (error: HttpError) => message.error(error.message ?? "Failed to save translations"),
      },
    );
  };

  return { locales, save, saving: mutation.isPending };
}
