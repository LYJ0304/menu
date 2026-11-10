"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatCalendarDate, getKoreanToday } from "@/features/meals/calendar";
import { getKoreanHolidays } from "@/lib/korean-holidays";
import { getMonthDates, shiftMonth } from "./calendar";
import { DayEvents } from "./day-events";
import { useScheduleEvents } from "./use-schedule-events";
import { sortScheduleEvents, type ScheduleEvent } from "./events";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function ScheduleCalendar({ initialToday }: { initialToday: string }) {
  const id = useId();
  const [today, setToday] = useState(initialToday);
  const [viewMonth, setViewMonth] = useState<string | null>(null);
  const [selection, setSelection] = useState<string | null>(null);
  const month = viewMonth ?? today.slice(0, 7);
  const selected = selection ?? today;
  const { events, save, remove } = useScheduleEvents();
  const eventsByDate = useMemo(() => {
    const grouped = new Map<string, ScheduleEvent[]>();
    for (const event of sortScheduleEvents(events)) {
      grouped.set(event.date, [...(grouped.get(event.date) ?? []), event]);
    }
    return grouped;
  }, [events]);
  const dates = useMemo(() => getMonthDates(month), [month]);
  const holidayName = (date: string) =>
    getKoreanHolidays(Number(date.slice(0, 4))).get(date);

  useEffect(() => {
    const refresh = () => setToday(getKoreanToday());
    refresh();
    const timer = setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  function moveMonth(offset: number) {
    const next = shiftMonth(month, offset);
    setViewMonth(next);
    setSelection(`${next}-01`);
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-8">
      <section
        aria-label="월별 달력"
        className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface"
      >
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-4 sm:px-5">
          <h2
            id={`${id}-month`}
            aria-live="polite"
            className="text-lg font-semibold tabular-nums text-ink"
          >
            {formatCalendarDate(`${month}-01`, {
              year: "numeric",
              month: "long",
            })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setViewMonth(null);
                setSelection(null);
              }}
              className="mr-1 min-h-10 rounded-md border border-line px-3 text-xs text-body hover:bg-canvas"
            >
              오늘
            </button>
            <button
              type="button"
              aria-label="이전 달"
              onClick={() => moveMonth(-1)}
              disabled={month === "1900-01"}
              className="flex size-10 items-center justify-center rounded-md text-body hover:bg-canvas disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="다음 달"
              onClick={() => moveMonth(1)}
              disabled={month === "2100-12"}
              className="flex size-10 items-center justify-center rounded-md text-body hover:bg-canvas disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <table
          aria-labelledby={`${id}-month`}
          className="w-full table-fixed border-collapse"
        >
          <thead>
            <tr>
              {weekdays.map((day, index) => (
                <th
                  key={day}
                  scope="col"
                  className={`h-10 text-xs font-normal ${index === 0 ? "text-red-600 dark:text-red-400" : index === 6 ? "text-blue-600 dark:text-blue-400" : "text-muted"}`}
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: dates.length / 7 }, (_, week) => (
              <tr key={week}>
                {dates.slice(week * 7, week * 7 + 7).map((date, index) => {
                  const holiday = holidayName(date);
                  const dayEvents = eventsByDate.get(date) ?? [];
                  const inMonth = date.startsWith(month);
                  const isToday = date === today;
                  const isSelected = date === selected;
                  return (
                    <td
                      key={date}
                      className="border-t border-line p-0 align-top"
                    >
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-current={isToday ? "date" : undefined}
                        aria-label={`${formatCalendarDate(date, { year: "numeric", month: "long", day: "numeric", weekday: "long" })}${holiday ? `, ${holiday}` : ""}${isToday ? ", 오늘" : ""}${dayEvents.length ? `, 일정 ${dayEvents.length}개` : ""}`}
                        onClick={() => {
                          setSelection(date);
                          setViewMonth(date.slice(0, 7));
                        }}
                        className={`flex min-h-20 w-full flex-col items-center gap-1 px-1 py-2 text-xs sm:min-h-28 sm:items-start sm:p-3 ${isSelected ? "bg-accent/10 ring-1 ring-inset ring-accent" : "hover:bg-canvas"} ${!inMonth ? "opacity-40" : ""}`}
                      >
                        <span
                          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm tabular-nums ${isToday ? "bg-accent font-semibold text-white dark:text-canvas" : holiday || index === 0 ? "text-red-600 dark:text-red-400" : index === 6 ? "text-blue-600 dark:text-blue-400" : "text-ink"}`}
                        >
                          {Number(date.slice(8))}
                        </span>
                        {holiday && (
                          <span
                            title={holiday}
                            className="line-clamp-2 w-full break-words text-center text-[10px] leading-4 text-red-600 sm:text-left sm:text-xs dark:text-red-400"
                          >
                            {holiday}
                          </span>
                        )}
                        {dayEvents.length > 0 && (
                          <span className="w-full min-w-0 text-accent">
                            <span className="block space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <span
                                  key={event.id}
                                  className="block break-all rounded bg-accent/10 px-1 py-0.5 text-center text-[10px] leading-4 sm:text-left sm:text-[11px]"
                                >
                                  {event.category}
                                </span>
                              ))}
                              {dayEvents.length > 2 && (
                                <span className="block text-left text-[10px]">
                                  +{dayEvents.length - 2}개
                                </span>
                              )}
                            </span>
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <aside
        aria-label="일정 목록"
        className="rounded-xl border border-line bg-surface p-5"
      >
        <DayEvents
          key={selected}
          date={selected}
          events={eventsByDate.get(selected) ?? []}
          onSave={save}
          onRemove={remove}
        />
      </aside>
    </div>
  );
}
