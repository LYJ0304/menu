import type { Metadata } from "next";
import { MilitaryCountdown } from "@/features/military/military-countdown";

export const metadata: Metadata = {
  title: "전역일 카운트다운 | 한끼",
  description: "전역까지 남은 시간과 실시간 복무 진행률을 확인하세요.",
};

export default function CountdownPage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8"
    >
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">
        전역일 카운트다운
      </h1>
      <MilitaryCountdown />
    </main>
  );
}
