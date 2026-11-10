import type { Metadata } from "next";
import { getKoreanToday } from "@/features/meals/calendar";
import { ScheduleCalendar } from "@/features/schedule/schedule-calendar";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "일정 | 한끼",
  description: "월별 달력에서 일정을 관리하고 대한민국 공휴일을 확인하세요.",
};

export default function SchedulePage() {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8"
    >
      <h1 className="mb-2 text-2xl font-semibold tracking-tight">일정</h1>
      <p className="mb-6 text-sm text-muted">
        날짜를 선택해 일정을 기록하세요.
      </p>
      <ScheduleCalendar initialToday={getKoreanToday()} />
    </main>
  );
}
