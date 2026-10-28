import { renderHook } from "@testing-library/react";
import dayjs from "dayjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mutateMock = vi.fn();
const refetchMock = vi.fn();
let customResult: { data: unknown[] } | undefined;

vi.mock("@refinedev/core", () => ({
  useCustom: () => ({ result: customResult, query: { refetch: refetchMock } }),
  useCustomMutation: () => ({ mutate: mutateMock, mutation: { isPending: false } }),
}));

import { useProductAttributes } from "./use-product-attributes";

describe("useProductAttributes", () => {
  beforeEach(() => {
    mutateMock.mockClear();
    refetchMock.mockClear();
    customResult = undefined;
  });

  describe("loading existing values into the form", () => {
    it("wraps date-type values in dayjs, passes other types through unchanged", () => {
      customResult = {
        data: [
          { attribute_id: "attr-date", code: "release_date", data_type: "date", value: "2026-05-01" },
          { attribute_id: "attr-text", code: "material", data_type: "text", value: "leather" },
          { attribute_id: "attr-bool", code: "waterproof", data_type: "boolean", value: true },
        ],
      };
      const setFieldsValue = vi.fn();

      renderHook(() => useProductAttributes("prod-1", { setFieldsValue } as never));

      expect(setFieldsValue).toHaveBeenCalledTimes(1);
      const [call] = setFieldsValue.mock.calls[0];
      expect(call["attr-text"]).toBe("leather");
      expect(call["attr-bool"]).toBe(true);
      expect(dayjs.isDayjs(call["attr-date"])).toBe(true);
      expect((call["attr-date"] as dayjs.Dayjs).format("YYYY-MM-DD")).toBe("2026-05-01");
    });

    it("does not wrap a date-type attribute with no value yet", () => {
      customResult = {
        data: [{ attribute_id: "attr-date", code: "release_date", data_type: "date", value: null }],
      };
      const setFieldsValue = vi.fn();

      renderHook(() => useProductAttributes("prod-1", { setFieldsValue } as never));

      expect(setFieldsValue).toHaveBeenCalledWith({ "attr-date": null });
    });

    it("does nothing when there is no result data yet", () => {
      customResult = undefined;
      const setFieldsValue = vi.fn();

      renderHook(() => useProductAttributes("prod-1", { setFieldsValue } as never));

      expect(setFieldsValue).not.toHaveBeenCalled();
    });
  });

  describe("save", () => {
    it("formats a dayjs date value back to YYYY-MM-DD and sends the PUT payload", () => {
      const { result } = renderHook(() => useProductAttributes("prod-1", { setFieldsValue: vi.fn() } as never));
      const productAttributes = [
        { attribute_id: "attr-date", attribute: { data_type: "date" } },
        { attribute_id: "attr-text", attribute: { data_type: "text" } },
      ];

      result.current.save(
        { "attr-date": dayjs("2026-05-01"), "attr-text": "leather" },
        productAttributes,
      );

      expect(mutateMock).toHaveBeenCalledTimes(1);
      const [args] = mutateMock.mock.calls[0];
      expect(args.method).toBe("put");
      expect(args.values).toEqual([
        { attribute_id: "attr-date", value: "2026-05-01" },
        { attribute_id: "attr-text", value: "leather" },
      ]);
    });

    it("drops attributes whose value is undefined or null from the payload", () => {
      const { result } = renderHook(() => useProductAttributes("prod-1", { setFieldsValue: vi.fn() } as never));
      const productAttributes = [
        { attribute_id: "attr-a", attribute: { data_type: "text" } },
        { attribute_id: "attr-b", attribute: { data_type: "text" } },
        { attribute_id: "attr-c", attribute: { data_type: "text" } },
      ];

      result.current.save(
        { "attr-a": "kept", "attr-b": undefined, "attr-c": null },
        productAttributes,
      );

      const [args] = mutateMock.mock.calls[0];
      expect(args.values).toEqual([{ attribute_id: "attr-a", value: "kept" }]);
    });

    it("passes a falsy-but-defined value through (e.g. boolean false, number 0)", () => {
      const { result } = renderHook(() => useProductAttributes("prod-1", { setFieldsValue: vi.fn() } as never));
      const productAttributes = [
        { attribute_id: "attr-bool", attribute: { data_type: "boolean" } },
        { attribute_id: "attr-num", attribute: { data_type: "number" } },
      ];

      result.current.save({ "attr-bool": false, "attr-num": 0 }, productAttributes);

      const [args] = mutateMock.mock.calls[0];
      expect(args.values).toEqual([
        { attribute_id: "attr-bool", value: false },
        { attribute_id: "attr-num", value: 0 },
      ]);
    });
  });
});
