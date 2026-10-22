import type { MenuItem } from "./types";

export function getMealCalories(items: MenuItem[]): number | null {
  if (!items.length || items.some((item) => item.calories === null))
    return null;
  return items.reduce((sum, item) => sum + Number(item.calories), 0);
}

export function formatCalories(value: number | string): string {
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 }).format(
    Number(value),
  );
}
