import { API_URL } from "../providers/constants";

export type TranslationRow = Record<string, unknown> & { locale: string };

export function translationsUrl(resourcePath: string, itemId: string) {
  return `${API_URL}/${resourcePath}/${itemId}/translations`;
}

// Every *_translations table has the same `slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`
// check constraint (products, categories, collections, attributes, ...) --
// normalize here, once, instead of trusting raw admin input and surfacing a
// raw Postgres constraint-violation error.
export function slugify(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
