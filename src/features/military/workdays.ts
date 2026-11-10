import { getKoreanHolidays } from "@/lib/korean-holidays";
import { shiftDate } from "@/features/meals/calendar";
import { parseMealDate } from "@/features/meals/date";

export const leaveLabels = {
  annual: "연가",
  reward: "포상휴가",
  consolation: "위로휴가",
  combatRest: "전투휴무",
} as const;
export type LeaveBalances = Record<keyof typeof leaveLabels, number>;
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
      !getKoreanHolidays(Number(date.slice(0, 4))).has(date)
    )
      count++;
  }
  return count;
}

export function subtractLeave(workdays: number, leave: LeaveBalances) {
  return Math.max(
    0,
    workdays -
      leave.annual -
      leave.reward -
      leave.consolation -
      leave.combatRest,
  );
}
