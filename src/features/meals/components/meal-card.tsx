import { Moon, Sun, Sunrise, Utensils } from "lucide-react";
import { formatCalories, getMealCalories } from "../presentation";
import type { MealType, MenuItem } from "../types";

const mealStyles = {
  BREAKFAST: {
    label: "아침",
    subtitle: "조식",
    icon: Sunrise,
    color: "bg-amber-50 text-amber-600",
    line: "bg-amber-400",
  },
  LUNCH: {
    label: "점심",
    subtitle: "중식",
    icon: Sun,
    color: "bg-sage text-forest",
    line: "bg-forest",
  },
  DINNER: {
    label: "저녁",
    subtitle: "석식",
    icon: Moon,
    color: "bg-violet-50 text-violet-500",
    line: "bg-violet-400",
  },
} as const;

export function MealCard({
  type,
  items,
}: {
  type: Exclude<MealType, "SPECIAL">;
  items: MenuItem[];
}) {
  const { label, subtitle, icon: Icon, color, line } = mealStyles[type];
  const calories = getMealCalories(items);

  return (
    <article
      aria-label={`${label} 식단`}
      className="relative flex min-h-88 flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-soft"
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${line}`} />
      <div className="flex items-center justify-between px-6 pt-7">
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-bold tracking-tight">{label}</h3>
          <span className="text-xs text-muted">{subtitle}</span>
        </div>
        <div
          className={`flex size-12 items-center justify-center rounded-2xl ${color}`}
        >
          <Icon className="size-6" strokeWidth={1.7} aria-hidden="true" />
        </div>
      </div>
      {items.length ? (
        <ul className="flex-1 space-y-3 px-6 py-7">
          {items.map((item, index) => (
            <li
              key={item.id}
              className={`flex gap-3 text-[15px] leading-6 ${index === 0 ? "font-semibold text-ink" : "text-body"}`}
            >
              <span
                className={`mt-2.5 size-1 shrink-0 rounded-full ${index === 0 ? "bg-forest" : "bg-line"}`}
                aria-hidden="true"
              />
              <span className="min-w-0 break-words">{item.menuName}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <Utensils
            className="size-7 text-line"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <p className="text-sm leading-6 text-muted">
            아직 등록된 메뉴가 없어요.
          </p>
        </div>
      )}
      <div className="mx-6 flex min-h-16 items-center justify-between gap-2 border-t border-line/80 py-4">
        <span className="text-xs text-muted">
          {items.length ? `${items.length}가지 메뉴` : "식단 등록 예정"}
        </span>
        <p className="text-sm font-bold text-ink">
          {calories === null ? (
            <span className="text-xs font-normal text-muted">
              열량 정보 없음
            </span>
          ) : (
            <>
              {formatCalories(calories)}{" "}
              <span className="text-xs font-normal text-muted">kcal</span>
            </>
          )}
        </p>
      </div>
    </article>
  );
}
