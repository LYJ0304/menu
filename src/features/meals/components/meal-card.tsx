import { formatCalories, getMealCalories } from "../presentation";
import type { MealType, MenuItem } from "../types";

const mealLabels = {
  BREAKFAST: "아침",
  LUNCH: "점심",
  DINNER: "저녁",
} as const;

export function MealCard({
  type,
  items,
}: {
  type: Exclude<MealType, "SPECIAL">;
  items: MenuItem[];
}) {
  const label = mealLabels[type];
  const calories = getMealCalories(items);

  return (
    <article
      aria-label={`${label} 식단`}
      className="flex min-h-56 flex-col rounded-lg border border-line bg-surface p-5 sm:min-h-64"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold">{label}</h3>
        {items.length > 0 && (
          <span className="text-xs tabular-nums text-muted">
            {items.length}개 메뉴
          </span>
        )}
      </div>
      {items.length ? (
        <ul className="my-5 flex-1 space-y-2 text-sm leading-6 text-body">
          {items.map((item) => (
            <li key={item.id} className="break-words">
              {item.menuName}
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex flex-1 items-center justify-center py-8 text-sm text-muted">
          등록된 메뉴 없음
        </p>
      )}
      <div className="flex items-center justify-between gap-2 border-t border-line pt-3 text-xs">
        <span className="text-muted">열량</span>
        <p className="tabular-nums text-body">
          {calories === null ? (
            "정보 없음"
          ) : (
            <>
              <span className="font-medium text-ink">
                {formatCalories(calories)}
              </span>{" "}
              kcal
            </>
          )}
        </p>
      </div>
    </article>
  );
}
