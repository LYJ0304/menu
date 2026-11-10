import { parseMealDate } from "@/features/meals/date";

export const scheduleCategories = [
  "연가",
  "포상휴가",
  "정기외박",
  "식기",
  "당직",
  "전투휴무",
] as const;

export type ScheduleEvent = {
  id: string;
  date: string;
  category: (typeof scheduleCategories)[number];
  notes: string;
};

export function isScheduleEvent(value: unknown): value is ScheduleEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<ScheduleEvent>;
  return (
    typeof event.id === "string" &&
    event.id.length > 0 &&
    typeof event.date === "string" &&
    parseMealDate(event.date) === event.date &&
    typeof event.category === "string" &&
    scheduleCategories.includes(event.category) &&
    typeof event.notes === "string" &&
    event.notes.length <= 500
  );
}

export function parseScheduleEvents(raw: string | null): ScheduleEvent[] {
  try {
    const value: unknown = JSON.parse(raw ?? "null");
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    return value.filter((event): event is ScheduleEvent => {
      if (!isScheduleEvent(event) || seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    });
  } catch {
    return [];
  }
}

export function sortScheduleEvents(events: ScheduleEvent[]) {
  return [...events].sort(
    (a, b) =>
      scheduleCategories.indexOf(a.category) -
      scheduleCategories.indexOf(b.category),
  );
}
