import type { Metadata } from "next";
import Link from "next/link";
import { Utensils } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { getDefaultMealType } from "@/features/meals/calendar";
import { MealSelectionProvider } from "@/features/meals/components/meal-selection";
import "./globals.css";

export const metadata: Metadata = {
  title: "한끼 | 제9030부대 식단표",
  description: "제9030부대의 오늘 식단과 이번 주 식단을 한눈에 확인하세요.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-selected focus:px-4 focus:py-3 focus:text-selected-foreground"
          >
            본문으로 바로가기
          </a>
          <header className="border-b border-line bg-surface">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
              <div className="flex items-center gap-8">
                <Link
                  href="/"
                  aria-label="한끼 홈"
                  className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink"
                >
                  <Utensils
                    className="size-4 text-accent"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                  한끼
                </Link>
                <nav aria-label="메인 메뉴" className="hidden sm:block">
                  <Link
                    href="/"
                    aria-current="page"
                    className="flex h-16 items-center border-b-2 border-ink text-sm font-medium text-ink"
                  >
                    식단표
                  </Link>
                </nav>
              </div>
              <ThemeToggle />
            </div>
          </header>
          <MealSelectionProvider initialMeal={getDefaultMealType()}>
            {children}
          </MealSelectionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
