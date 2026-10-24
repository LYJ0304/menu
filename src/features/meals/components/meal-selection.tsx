"use client";

import { createContext, useContext, useId, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { MealType } from "../types";

type RegularMeal = Exclude<MealType, "SPECIAL">;

const meals = [
  { type: "BREAKFAST", label: "아침" },
  { type: "LUNCH", label: "점심" },
  { type: "DINNER", label: "저녁" },
] as const;

const MealSelectionContext = createContext<{
  selected: RegularMeal;
  setSelected: Dispatch<SetStateAction<RegularMeal>>;
} | null>(null);

export function MealSelectionProvider({
  initialMeal,
  children,
}: {
  initialMeal: RegularMeal;
  children: ReactNode;
}) {
  const [selected, setSelected] = useState(initialMeal);
  return (
    <MealSelectionContext value={{ selected, setSelected }}>
      {children}
    </MealSelectionContext>
  );
}

export function MobileMealTabs({ cards }: { cards: ReactNode[] }) {
  const selection = useContext(MealSelectionContext);
  const id = useId();
  if (!selection) throw new Error("MealSelectionProvider is required");
  const { selected, setSelected } = selection;
  const selectedIndex = meals.findIndex((meal) => meal.type === selected);

  return (
    <div className="md:hidden">
      <div
        role="tablist"
        aria-label="식사 선택"
        className="mb-3 grid grid-cols-3 gap-1 rounded-lg border border-line bg-surface p-1"
      >
        {meals.map(({ type, label }, index) => (
          <button
            key={type}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel`}
            aria-selected={selected === type}
            tabIndex={selected === type ? 0 : -1}
            className={`min-h-11 rounded-md text-sm font-medium ${selected === type ? "bg-selected text-selected-foreground" : "text-body hover:bg-canvas"}`}
            onClick={() => setSelected(type)}
            onKeyDown={(event) => {
              let next: number;
              switch (event.key) {
                case "ArrowRight":
                  next = (index + 1) % meals.length;
                  break;
                case "ArrowLeft":
                  next = (index + meals.length - 1) % meals.length;
                  break;
                case "Home":
                  next = 0;
                  break;
                case "End":
                  next = meals.length - 1;
                  break;
                default:
                  return;
              }
              event.preventDefault();
              setSelected(meals[next].type);
              document.getElementById(`${id}-tab-${next}`)?.focus();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${selectedIndex}`}
        tabIndex={0}
      >
        {cards[selectedIndex]}
      </div>
    </div>
  );
}
