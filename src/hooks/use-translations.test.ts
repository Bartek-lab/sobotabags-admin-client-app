import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mutateMock = vi.fn();
const refetchMock = vi.fn();
const localesData = [{ code: "pl", name: "Polski", is_active: true }];

vi.mock("@refinedev/core", () => ({
  useList: () => ({ result: { data: localesData } }),
  useCustom: () => ({ result: { data: undefined }, query: { refetch: refetchMock } }),
  useCustomMutation: () => ({ mutate: mutateMock, mutation: { isPending: false } }),
}));

import { useTranslations, translationFieldKey, type TranslationField } from "./use-translations";

const PRODUCT_FIELDS: TranslationField[] = [
  { name: "name", label: "Name", required: true },
  { name: "slug", label: "Slug", required: true },
  { name: "short_description", label: "Short description", type: "textarea" },
  { name: "meta_title", label: "Meta title", seo: true, autoFillFrom: "name" },
  {
    name: "meta_description",
    label: "Meta description",
    type: "textarea",
    seo: true,
    autoFillFrom: "short_description",
  },
];

function renderSave(fields: TranslationField[] = PRODUCT_FIELDS) {
  const { result } = renderHook(() => useTranslations("products", "prod-1", fields, { setFieldsValue: vi.fn() } as never));
  return result;
}

describe("useTranslations SEO auto-fill on save", () => {
  beforeEach(() => {
    mutateMock.mockClear();
  });

  it("fills meta_title/meta_description from their source fields when left blank", () => {
    const result = renderSave();
    result.current.save({
      [translationFieldKey("pl", "name")]: "Shopper Bea",
      [translationFieldKey("pl", "slug")]: "shopper-bea",
      [translationFieldKey("pl", "short_description")]: "Ręcznie robiona torba ze skóry naturalnej.",
      [translationFieldKey("pl", "meta_title")]: "",
      [translationFieldKey("pl", "meta_description")]: "",
    });

    const [{ values }] = mutateMock.mock.calls[0];
    expect(values).toEqual([
      expect.objectContaining({
        meta_title: "Shopper Bea",
        meta_description: "Ręcznie robiona torba ze skóry naturalnej.",
      }),
    ]);
  });

  it("does not override a meta field the admin explicitly filled in", () => {
    const result = renderSave();
    result.current.save({
      [translationFieldKey("pl", "name")]: "Shopper Bea",
      [translationFieldKey("pl", "slug")]: "shopper-bea",
      [translationFieldKey("pl", "short_description")]: "domyślny opis",
      [translationFieldKey("pl", "meta_title")]: "Custom SEO title",
      [translationFieldKey("pl", "meta_description")]: "Custom SEO description",
    });

    const [{ values }] = mutateMock.mock.calls[0];
    expect(values[0].meta_title).toBe("Custom SEO title");
    expect(values[0].meta_description).toBe("Custom SEO description");
  });

  it("strips HTML and truncates meta_description to 160 characters", () => {
    const result = renderSave();
    const longHtml = `<p>${"a".repeat(200)}</p>`;
    result.current.save({
      [translationFieldKey("pl", "name")]: "Shopper Bea",
      [translationFieldKey("pl", "slug")]: "shopper-bea",
      [translationFieldKey("pl", "short_description")]: longHtml,
      [translationFieldKey("pl", "meta_title")]: "",
      [translationFieldKey("pl", "meta_description")]: "",
    });

    const [{ values }] = mutateMock.mock.calls[0];
    expect(values[0].meta_description).toBe("a".repeat(160));
    expect(values[0].meta_description).not.toContain("<p>");
  });

  it("leaves an auto-fill field empty if its source field is also empty", () => {
    const result = renderSave();
    result.current.save({
      [translationFieldKey("pl", "name")]: "",
      [translationFieldKey("pl", "slug")]: "",
      [translationFieldKey("pl", "short_description")]: "",
      [translationFieldKey("pl", "meta_title")]: "",
      [translationFieldKey("pl", "meta_description")]: "",
    });

    const [{ values }] = mutateMock.mock.calls[0];
    expect(values[0].meta_title).toBe("");
    expect(values[0].meta_description).toBe("");
  });
});
