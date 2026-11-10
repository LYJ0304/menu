import { shiftDate } from "@/features/meals/calendar";

/** A Sunday-first calendar including the adjacent days needed to fill weeks. */
export function getMonthDates(month: string) {
  const first = `${month}-01`;
  const next = shiftMonth(month, 1);
  const daysInMonth =
    new Date(`${next}-01T00:00:00Z`).getTime() -
    new Date(`${first}T00:00:00Z`).getTime();
  const offset = new Date(`${first}T00:00:00Z`).getUTCDay();
  const count = Math.ceil((daysInMonth / 86_400_000 + offset) / 7) * 7;
  return Array.from({ length: count }, (_, day) =>
    shiftDate(first, day - offset),
  );
}

export function shiftMonth(month: string, offset: number) {
  const date = new Date(`${month}-01T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}
