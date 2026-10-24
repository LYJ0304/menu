"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      title="라이트 / 다크 모드 전환"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex size-10 items-center justify-center rounded-md border border-line text-body hover:bg-canvas hover:text-ink"
    >
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
      <span className="sr-only dark:hidden">다크 모드로 전환</span>
      <span className="sr-only hidden dark:inline">라이트 모드로 전환</span>
    </button>
  );
}
