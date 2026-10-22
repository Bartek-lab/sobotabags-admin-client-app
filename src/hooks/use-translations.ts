import { useCustom, useCustomMutation, useList, type HttpError } from "@refinedev/core";
import { useEffect } from "react";
import { message, type FormInstance } from "antd";
import { slugify, translationsUrl, type TranslationRow } from "../api/translations";

type Locale = { code: string; name: string; is_active: boolean | null };
export type TranslationField = { name: string; label: string; type?: "text" | "textarea"; required?: boolean };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationsResult, form]);

  const save = (values: Record<string, unknown>) => {
    const payload = locales.map((l) => {
      const row: Record<string, unknown> = { locale: l.code };
      for (const f of fields) {
        const raw = values[translationFieldKey(l.code, f.name)];
        row[f.name] = f.name === "slug" ? slugify(raw) : raw;
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
