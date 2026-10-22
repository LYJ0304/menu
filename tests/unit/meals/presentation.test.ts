import { expect, it } from "vitest";
import { formatCalories, getMealCalories } from "@/features/meals/presentation";
import type { MenuItem } from "@/features/meals/types";

const item: MenuItem = {
  id: "menu-1",
  mealDate: "2026-10-22",
  mealType: "LUNCH",
  menuName: "밥",
  calories: "350.25",
  rawCalories: "350.25kcal",
};

it("totals complete meal calories and formats decimal values", () => {
  expect(
    getMealCalories([item, { ...item, id: "menu-2", calories: "100.25" }]),
  ).toBe(450.5);
  expect(formatCalories("1234.50")).toBe("1,234.5");
});

it("does not present incomplete calorie information as a meal total", () => {
  expect(getMealCalories([])).toBeNull();
  expect(getMealCalories([item, { ...item, calories: null }])).toBeNull();
  expect(getMealCalories([{ ...item, calories: "0" }])).toBe(0);
});
