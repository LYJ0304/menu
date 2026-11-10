import Holidays from "date-holidays";
import { shiftDate } from "@/features/meals/calendar";

// Election days and temporary public holidays are one-off declarations, not
// recurring rules. Keep these alongside the maintained Korean holiday calendar.
const specialHolidays = new Set([
  "2020-04-15",
  "2020-08-17",
  "2022-03-09",
  "2022-06-01",
  "2023-10-02",
  "2024-04-10",
  "2025-01-27",
  "2025-06-03",
  "2026-06-03",
  "2028-04-12",
]);
const holidays = new Holidays("KR", {
  types: ["public"],
  timezone: "Asia/Seoul",
});
const holidayYears = new Map<number, Map<string, string>>();

export function getKoreanHolidays(year: number) {
  const cached = holidayYears.get(year);
  if (cached) return cached;
  const dates = new Map<string, string>();
  for (const holiday of holidays.getHolidays(year)) {
    // Upstream's Seollal range starts on lunar New Year's Day; Korea's
    // three-day holiday starts the day before. Do not shift substitute days.
    const correction = holiday.rule === "korean 01-0-01 P3D" ? -1 : 0;
    const start = shiftDate(holiday.date.slice(0, 10), correction);
    const duration = Math.round(
      (holiday.end.getTime() - holiday.start.getTime()) / 86_400_000,
    );
    for (let day = 0; day < duration; day++)
      dates.set(shiftDate(start, day), holiday.name);
  }
  for (const date of specialHolidays) {
    if (date.startsWith(`${year}-`)) dates.set(date, "임시공휴일·선거일");
  }
  holidayYears.set(year, dates);
  return dates;
}
