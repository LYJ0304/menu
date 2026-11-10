import { parseMealDate } from "@/features/meals/date";

export type ScheduleEvent = {
  id: string;
  date: string;
  title: string;
  time: string;
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
    typeof event.title === "string" &&
    event.title.trim().length > 0 &&
    event.title.length <= 80 &&
    typeof event.time === "string" &&
    (event.time === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(event.time)) &&
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
      a.time.localeCompare(b.time) || a.title.localeCompare(b.title, "ko"),
  );
}
