import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, MapPin, Utensils } from "lucide-react";
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
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-forest focus:px-4 focus:py-3 focus:text-white"
        >
          본문으로 바로가기
        </a>
        <header className="border-b border-line bg-white">
          <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-8">
            <div className="flex items-center gap-7 sm:gap-12">
              <Link
                href="/"
                aria-label="한끼 홈"
                className="flex items-center gap-2.5"
              >
                <span className="flex size-9 items-center justify-center rounded-xl bg-forest text-white">
                  <Utensils
                    className="size-5"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
                <span className="text-[23px] font-extrabold tracking-tight text-forest">
                  한끼<span className="text-ink">.</span>
                </span>
              </Link>
              <nav
                aria-label="메인 메뉴"
                className="hidden self-stretch sm:flex"
              >
                <Link
                  href="/"
                  aria-current="page"
                  className="flex items-center gap-2 border-b-2 border-forest py-7 text-sm font-semibold text-forest"
                >
                  <CalendarDays className="size-4" aria-hidden="true" />
                  식단표
                </Link>
              </nav>
            </div>
            <p className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-2 text-xs font-medium text-body">
              <MapPin className="size-3.5 text-forest" aria-hidden="true" />
              제9030부대
            </p>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
