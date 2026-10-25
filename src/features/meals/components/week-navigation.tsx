import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCalendarDate, getWeekDates, shiftDate } from "../calendar";

export function WeekNavigation({
  today,
  selectedDate,
}: {
  today: string;
  selectedDate: string;
}) {
  const dates = getWeekDates(selectedDate);
  const label = (date: string) =>
    formatCalendarDate(date, { month: "numeric", day: "numeric" });

  return (
    <section
      className="rounded-lg border border-line bg-surface p-3 sm:px-4"
      aria-labelledby="week-heading"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-2 text-sm">
          <h2 id="week-heading" className="shrink-0 font-semibold">
            {dates.includes(today) ? "이번 주" : "주간 식단"}
          </h2>
          <span className="truncate text-xs tabular-nums text-muted">
            {dates[0].slice(0, 4)}. {label(dates[0])} – {label(dates[6])}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/?date=${today}`}
            scroll={false}
            className="flex min-h-9 items-center rounded-md px-2 text-xs font-medium text-body hover:bg-canvas hover:text-ink"
          >
            오늘
          </Link>
          <Link
            href={`/?date=${shiftDate(selectedDate, -7)}`}
            scroll={false}
            aria-label="이전 주 식단 보기"
            className="flex size-9 items-center justify-center rounded-md text-muted hover:bg-canvas hover:text-ink"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href={`/?date=${shiftDate(selectedDate, 7)}`}
            scroll={false}
            aria-label="다음 주 식단 보기"
            className="flex size-9 items-center justify-center rounded-md text-muted hover:bg-canvas hover:text-ink"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
      <nav aria-label="주간 날짜 선택" className="grid grid-cols-7 gap-1">
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
              className={`relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-md transition-colors ${selected ? "bg-selected text-selected-foreground" : "hover:bg-canvas"}`}
            >
              <span
                className={`text-[11px] leading-4 ${selected ? "text-selected-foreground/75" : index === 6 ? "text-rose-600 dark:text-rose-400" : index === 5 ? "text-blue-600 dark:text-blue-400" : "text-muted"}`}
              >
                {formatCalendarDate(date, { weekday: "short" })}
              </span>
              <span className="text-base font-semibold leading-5 tabular-nums">
                {Number(date.slice(8))}
              </span>
              {isToday && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 h-0.5 w-3 rounded-full ${selected ? "bg-selected-foreground/60" : "bg-accent"}`}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
