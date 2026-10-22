import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Menu | 병영 식단",
  description: "병영 식단 조회, 리뷰 및 메뉴 추천 서비스",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
