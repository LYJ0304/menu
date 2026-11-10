import { describe, expect, it } from "vitest";
import {
  parseScheduleEvents,
  sortScheduleEvents,
} from "@/features/schedule/events";

const event = {
  id: "one",
  date: "2026-11-10",
  title: "외출",
  time: "09:30",
  notes: "정문 집합",
};

describe("browser schedule records", () => {
  it("restores multiple events and all-day events", () => {
    const events = [event, { ...event, id: "two", time: "", title: "휴가" }];
    expect(parseScheduleEvents(JSON.stringify(events))).toEqual(events);
  });
  it("ignores malformed storage, invalid records, and duplicate IDs", () => {
    for (const raw of [null, "broken", "{}", "null"])
      expect(parseScheduleEvents(raw)).toEqual([]);
    const invalid = [
      { ...event, date: "2026-02-30" },
      { ...event, title: " " },
      { ...event, time: "24:00" },
      { ...event, time: "09:60" },
      { ...event, notes: "x".repeat(501) },
      { ...event, title: "x".repeat(81) },
      { ...event, id: "" },
      null,
    ];
    expect(
      parseScheduleEvents(JSON.stringify([...invalid, event, event])),
    ).toEqual([event]);
  });
  it("sorts all-day events first, then timed events without mutating input", () => {
    const events = [
      event,
      { ...event, id: "two", time: "18:00" },
      { ...event, id: "three", time: "" },
    ];
    expect(sortScheduleEvents(events).map((item) => item.id)).toEqual([
      "three",
      "one",
      "two",
    ]);
    expect(events[0]).toBe(event);
  });
});
