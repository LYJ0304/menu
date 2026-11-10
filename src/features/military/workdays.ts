import Holidays from "date-holidays";
import { shiftDate } from "@/features/meals/calendar";
import { parseMealDate } from "@/features/meals/date";

export const leaveLabels = {
  annual: "연가",
  reward: "포상휴가",
  consolation: "위로휴가",
  combatRest: "전투휴무",
} as const;
export type LeaveBalances = Record<keyof typeof leaveLabels, number>;
export const emptyLeave: LeaveBalances = {
  annual: 0,
  reward: 0,
  consolation: 0,
  combatRest: 0,
};

export function parseLeaveBalances(raw: string | null): LeaveBalances {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || typeof value !== "object") return emptyLeave;
    const result = { ...emptyLeave };
    for (const key of Object.keys(result) as (keyof LeaveBalances)[]) {
      const days = value[key];
      if (
        typeof days === "number" &&
        Number.isInteger(days) &&
        days >= 0 &&
        days <= 999
      ) {
        result[key] = days;
      }
    }
    return result;
  } catch {
    return emptyLeave;
  }
}

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
const holidayYears = new Map<number, Set<string>>();

function getHolidayDates(year: number) {
  const cached = holidayYears.get(year);
  if (cached) return cached;
  const dates = new Set<string>();
  for (const holiday of holidays.getHolidays(year)) {
    // Upstream's Seollal range starts on lunar New Year's Day; Korea's
    // three-day holiday starts the day before. Do not shift substitute days.
    const correction = holiday.rule === "korean 01-0-01 P3D" ? -1 : 0;
    const start = shiftDate(holiday.date.slice(0, 10), correction);
    const duration = Math.round(
      (holiday.end.getTime() - holiday.start.getTime()) / 86_400_000,
    );
    for (let day = 0; day < duration; day++) dates.add(shiftDate(start, day));
  }
  for (const date of specialHolidays) {
    if (date.startsWith(`${year}-`)) dates.add(date);
  }
  holidayYears.set(year, dates);
  return dates;
}

/** Includes today (or enlistment if later), excludes discharge day. */
export function countRemainingWorkdays(
  enlistment: string,
  discharge: string,
  today: string,
) {
  if (
    [enlistment, discharge, today].some(
      (date) => !date || parseMealDate(date) !== date,
    ) ||
    enlistment >= discharge
  ) {
    return null;
  }
  let count = 0;
  for (
    let date = today > enlistment ? today : enlistment;
    date < discharge;
    date = shiftDate(date, 1)
  ) {
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    if (
      weekday !== 0 &&
      weekday !== 6 &&
      !getHolidayDates(Number(date.slice(0, 4))).has(date)
    )
      count++;
  }
  return count;
}

export function subtractLeave(workdays: number, leave: LeaveBalances) {
  return Math.max(
    0,
    workdays - leave.annual - leave.reward - leave.consolation - leave.combatRest,
  );
}
