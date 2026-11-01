import { getKoreanToday } from "@/features/meals/calendar";
import { parseMealDate } from "@/features/meals/date";

export function calculateMilitaryCountdown(
  enlistment: string,
  discharge: string,
  now = Date.now(),
) {
  if (
    !enlistment ||
    !discharge ||
    parseMealDate(enlistment) !== enlistment ||
    parseMealDate(discharge) !== discharge ||
    !Number.isFinite(now)
  )
    return null;

  // Date-only values mean midnight in Korea, never UTC or the device timezone.
  const start = Date.parse(`${enlistment}T00:00:00+09:00`);
  const end = Date.parse(`${discharge}T00:00:00+09:00`);
  if (start >= end) return null;

  const today = Date.parse(`${getKoreanToday(new Date(now))}T00:00:00+09:00`);
  const remaining = Math.max(0, Math.ceil((end - now) / 1000));
  return {
    dday: Math.max(0, Math.round((end - today) / 86_400_000)),
    days: Math.floor(remaining / 86_400),
    hours: Math.floor((remaining % 86_400) / 3600),
    minutes: Math.floor((remaining % 3600) / 60),
    seconds: remaining % 60,
    progress: Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100)),
  };
}

export function parseStoredServiceDates(raw: string | null) {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== "object" ||
      value === null ||
      !("enlistment" in value) ||
      typeof value.enlistment !== "string" ||
      !("discharge" in value) ||
      typeof value.discharge !== "string" ||
      !calculateMilitaryCountdown(value.enlistment, value.discharge, 0)
    )
      return null;
    return { enlistment: value.enlistment, discharge: value.discharge };
  } catch {
    return null;
  }
}
