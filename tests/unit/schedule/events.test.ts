import { describe, expect, it } from "vitest";
import {
  parseScheduleEvents,
  scheduleCategories,
  sortScheduleEvents,
  type ScheduleEvent,
} from "@/features/schedule/events";

const event: ScheduleEvent = {
  id: "one",
  date: "2026-11-10",
  category: "연가",
  notes: "오전 출발",
};

describe("browser schedule records", () => {
  it("restores every supported category and optional notes", () => {
    const events = scheduleCategories.map((category, i) => ({
      ...event,
      id: String(i),
      category,
      notes: i ? "" : event.notes,
    }));
    expect(parseScheduleEvents(JSON.stringify(events))).toEqual(events);
  });
  it("ignores malformed storage, unsupported categories and duplicate IDs", () => {
    for (const raw of [null, "broken", "{}", "null"])
      expect(parseScheduleEvents(raw)).toEqual([]);
    const invalid = [
      { ...event, date: "2026-02-30" },
      { ...event, category: "" },
      { ...event, category: "임의 일정" },
      { ...event, notes: "x".repeat(501) },
      { ...event, id: "" },
      null,
    ];
    expect(
      parseScheduleEvents(JSON.stringify([...invalid, event, event])),
    ).toEqual([event]);
  });
  it("sorts by category order without mutating input", () => {
    const events: ScheduleEvent[] = [
      { ...event, id: "two", category: "당직" },
      event,
      { ...event, id: "three", category: "전투휴무" },
    ];
    expect(sortScheduleEvents(events).map((item) => item.id)).toEqual([
      "one",
      "two",
      "three",
    ]);
    expect(events[0].id).toBe("two");
  });
});
