import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, RotateCcw } from "lucide-react";
import { formatCalendarDate, getWeekDates, shiftDate } from "../calendar";

export function WeekNavigation({
  today,
  selectedDate,
}: {
  today: string;
  selectedDate: string;
}) {
  const dates = getWeekDates(selectedDate);
  const isCurrentWeek = dates.includes(today);
  const label = (date: string) =>
    formatCalendarDate(date, { month: "numeric", day: "numeric" });

  return (
    <section
      className="rounded-3xl border border-line bg-white p-4 shadow-soft sm:p-6"
      aria-labelledby="week-heading"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarDays className="size-5 text-forest" aria-hidden="true" />
          <h2 id="week-heading" className="text-base font-bold">
            {isCurrentWeek ? "이번 주 식단" : "주간 식단"}
          </h2>
          <span className="hidden text-sm text-muted sm:inline">
            {label(dates[0])} – {label(dates[6])}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            scroll={false}
            className="mr-1 flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-forest hover:bg-sage"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            오늘
          </Link>
          <Link
            href={`/?date=${shiftDate(selectedDate, -7)}`}
            scroll={false}
            aria-label="이전 주 식단 보기"
            className="flex size-10 items-center justify-center rounded-xl border border-line text-muted hover:bg-canvas hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={`/?date=${shiftDate(selectedDate, 7)}`}
            scroll={false}
            aria-label="다음 주 식단 보기"
            className="flex size-10 items-center justify-center rounded-xl border border-line text-muted hover:bg-canvas hover:text-ink"
          >
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <nav
        aria-label="주간 날짜 선택"
        className="grid grid-cols-7 gap-1.5 sm:gap-3"
      >
        {dates.map((date, index) => {
          const selected = date === selectedDate;
          const isToday = date === today;
          return (
            <Link
              key={date}
              href={`/?date=${date}`}
              scroll={false}
              aria-current={selected ? "date" : undefined}
              aria-label={`${formatCalendarDate(date, { year: "numeric", month: "long", day: "numeric", weekday: "long" })}${isToday ? ", 오늘" : ""}`}
              className={`flex min-h-26 flex-col items-center justify-center gap-1.5 rounded-2xl border py-3 transition-colors sm:min-h-29 ${selected ? "border-forest bg-forest text-white shadow-sm" : "border-transparent bg-canvas/70 hover:border-forest/20 hover:bg-sage"}`}
            >
              <span
                className={`text-xs font-medium sm:text-sm ${selected ? "text-white/75" : index === 6 ? "text-rose-600" : index === 5 ? "text-blue-600" : "text-muted"}`}
              >
                {formatCalendarDate(date, { weekday: "short" })}
              </span>
              <span className="text-xl font-bold tracking-tight sm:text-2xl">
                {Number(date.slice(8))}
              </span>
              <span
                className={`h-4 text-[10px] font-semibold sm:text-[11px] ${selected ? "text-white/85" : "text-forest"}`}
              >
                {isToday ? "오늘" : selected ? "선택" : ""}
              </span>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
