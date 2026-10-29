import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Regression test for a live-caught crash: "Uncaught Error: Minified React
// error #185" (Maximum update depth exceeded) on the product edit page.
//
// Root cause: Refine's real useCustom() returns `result: { data: ... }` as
// a brand-new object literal on every single render (confirmed by reading
// @refinedev/core's source directly), even when the underlying fetched
// data hasn't changed. The hook's useEffect depended on that whole `result`
// object -- React's Object.is() dependency check always saw a "new" value,
// so the effect (which calls setState) fired every render, which triggered
// another render, forever.
//
// This mock reproduces that exact non-memoized behavior deliberately --
// unlike the component-level test's mock (which returns a stable object),
// this one constructs a fresh `{ data, query }` on every call, the same way
// real Refine does.
// react-query itself DOES memoize the fetched data -- only Refine's own
// useCustom wrapper is unmemoized (a fresh `{ data: ... }` object literal
// every render, confirmed by reading @refinedev/core's source). This
// stable array is what a real, settled query would hand back across
// renders; only the outer wrapper object is reconstructed each call.
const stableData = [{ category_id: "cat-1", code: "bags", is_primary: true, sort_order: 0 }];
let callCount = 0;
vi.mock("@refinedev/core", () => ({
  useCustom: () => {
    callCount += 1;
    return { result: { data: stableData }, query: { isLoading: false } };
  },
  useCustomMutation: () => ({ mutate: vi.fn(), mutation: { isPending: false } }),
}));

import { useProductCategories } from "./use-product-categories";

describe("useProductCategories", () => {
  it("settles into a stable categoryIds/primaryId state instead of looping forever", async () => {
    callCount = 0;
    const { result } = renderHook(() => useProductCategories("prod-1"));

    await waitFor(() => {
      expect(result.current.categoryIds).toEqual(["cat-1"]);
    });
    expect(result.current.primaryId).toBe("cat-1");

    // The real bug made useCustom (and therefore the component) re-render
    // without ever stopping. A healthy hook settles within a small, bounded
    // number of calls -- not hundreds, and the test itself not hanging/
    // timing out is already strong evidence against an infinite loop.
    const callsAfterSettling = callCount;
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(callCount).toBe(callsAfterSettling);
  });
});
