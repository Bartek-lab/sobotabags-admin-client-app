import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type TestCategory = {
  id: string;
  code: string;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  name: string | null;
};

const defaultCategories: TestCategory[] = [
  { id: "cat-bags", code: "bags", parent_id: null, is_active: true, sort_order: 0, name: "Torby" },
  {
    id: "cat-handbags",
    code: "handbags",
    parent_id: "cat-bags",
    is_active: true,
    sort_order: 0,
    name: "Torebki",
  },
  { id: "cat-men", code: "men", parent_id: null, is_active: false, sort_order: 0, name: "Dla panów" },
];
let categories: typeof defaultCategories = defaultCategories;

vi.mock("@refinedev/core", () => ({
  useCustom: () => ({ result: { data: categories }, query: { isLoading: false } }),
}));

const setCategoryIds = vi.fn();
const setPrimaryId = vi.fn();
const save = vi.fn();
let hookState: {
  categoryIds: string[];
  primaryId: string | null;
  setCategoryIds: typeof setCategoryIds;
  setPrimaryId: typeof setPrimaryId;
  save: typeof save;
  saving: boolean;
};

vi.mock("../hooks/use-product-categories", () => ({
  useProductCategories: () => hookState,
}));

import { ProductCategoriesCard } from "./product-categories-card";

describe("ProductCategoriesCard", () => {
  beforeEach(() => {
    setCategoryIds.mockClear();
    setPrimaryId.mockClear();
    save.mockClear();
    categories = defaultCategories;
    hookState = {
      categoryIds: ["cat-handbags"],
      primaryId: "cat-handbags",
      setCategoryIds,
      setPrimaryId,
      save,
      saving: false,
    };
  });

  it("renders nothing without a productId", () => {
    const { container } = render(<ProductCategoriesCard productId={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the parent/child translated name and an (inactive) marker where applicable", () => {
    render(<ProductCategoriesCard productId="prod-1" />);
    expect(screen.getByText((_, el) => el?.textContent === "Torby / Torebki")).toBeInTheDocument();
    expect(screen.getByText("(inactive)", { exact: false })).toBeInTheDocument();
  });

  it("falls back to the raw code and shows a warning tag when a category has no translation yet", () => {
    categories = [
      ...defaultCategories,
      { id: "cat-funny", code: "funny_bags", parent_id: null, is_active: true, sort_order: 0, name: null },
    ];
    render(<ProductCategoriesCard productId="prod-1" />);
    expect(screen.getByText("funny_bags")).toBeInTheDocument();
    expect(screen.getByText(/no translation yet/i)).toBeInTheDocument();
  });

  it("checking a new category adds it to categoryIds without touching primaryId", () => {
    render(<ProductCategoriesCard productId="prod-1" />);

    // "men" is unchecked in this fixture -- its checkbox is the 3rd one.
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[2]);

    expect(setCategoryIds).toHaveBeenCalledWith(["cat-handbags", "cat-men"]);
    expect(setPrimaryId).not.toHaveBeenCalled();
  });

  it("unchecking the currently-primary category clears primaryId, falling back to the next selected one", () => {
    hookState.categoryIds = ["cat-handbags", "cat-bags"];
    hookState.primaryId = "cat-handbags";
    render(<ProductCategoriesCard productId="prod-1" />);

    // order rendered is bags, bags/handbags, men -- "handbags" is the 2nd checkbox.
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);

    expect(setCategoryIds).toHaveBeenCalledWith(["cat-bags"]);
    expect(setPrimaryId).toHaveBeenCalledWith("cat-bags");
  });

  it("unchecking the primary category with nothing else selected clears primaryId to null", () => {
    hookState.categoryIds = ["cat-handbags"];
    hookState.primaryId = "cat-handbags";
    render(<ProductCategoriesCard productId="prod-1" />);

    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);

    expect(setCategoryIds).toHaveBeenCalledWith([]);
    expect(setPrimaryId).toHaveBeenCalledWith(null);
  });

  it("unchecking a non-primary category leaves primaryId untouched", () => {
    hookState.categoryIds = ["cat-handbags", "cat-bags"];
    hookState.primaryId = "cat-handbags";
    render(<ProductCategoriesCard productId="prod-1" />);

    // "bags" (not primary) is the 1st checkbox.
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    expect(setCategoryIds).toHaveBeenCalledWith(["cat-handbags"]);
    expect(setPrimaryId).not.toHaveBeenCalled();
  });

  it("clicking Save invokes save() (current categoryIds/primaryId are read from the hook, not passed in)", () => {
    render(<ProductCategoriesCard productId="prod-1" />);
    fireEvent.click(screen.getByRole("button", { name: /save categories/i }));
    expect(save).toHaveBeenCalledTimes(1);
  });

  it("shows the empty-state message when there are no categories at all", () => {
    categories = [];
    hookState.categoryIds = [];
    hookState.primaryId = null;
    render(<ProductCategoriesCard productId="prod-1" />);

    expect(screen.getByText(/no categories defined yet/i)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  // Regression: a non-array `result.data` (e.g. an unexpected response
  // shape) must not crash the page -- confirmed live, `categories.map` on
  // a non-array threw an uncaught TypeError that took down the whole
  // product edit page.
  it("treats a non-array response as empty instead of crashing", () => {
    categories = { not: "an array" } as unknown as TestCategory[];
    hookState.categoryIds = [];
    hookState.primaryId = null;
    render(<ProductCategoriesCard productId="prod-1" />);

    expect(screen.getByText(/no categories defined yet/i)).toBeInTheDocument();
  });
});
