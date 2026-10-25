import { describe, expect, it } from "vitest";
import {
  getDefaultMealDate,
  getDefaultMealType,
  getKoreanToday,
  getWeekDates,
  shiftDate,
} from "@/features/meals/calendar";

describe("meal calendar", () => {
  it.each([
    ["2026-10-23T00:00:00+09:00", "BREAKFAST"],
    ["2026-10-23T08:29:59+09:00", "BREAKFAST"],
    ["2026-10-23T08:30:00+09:00", "LUNCH"],
    ["2026-10-23T12:59:59+09:00", "LUNCH"],
    ["2026-10-23T13:00:00+09:00", "DINNER"],
    ["2026-10-23T18:59:59+09:00", "DINNER"],
    ["2026-10-23T19:00:00+09:00", "BREAKFAST"],
    ["2026-10-23T23:59:59+09:00", "BREAKFAST"],
    ["2026-10-23T04:00:00Z", "DINNER"],
    ["2026-10-23T03:59:59Z", "LUNCH"],
  ])("selects the default meal in Korea at %s", (time, expected) => {
    expect(getDefaultMealType(new Date(time))).toBe(expected);
  });

  it.each([
    ["2026-10-23T18:59:59+09:00", "2026-10-23"],
    ["2026-10-23T19:00:00+09:00", "2026-10-24"],
    ["2026-10-23T23:59:59+09:00", "2026-10-24"],
    ["2026-10-24T00:00:00+09:00", "2026-10-24"],
    ["2026-10-24T08:30:00+09:00", "2026-10-24"],
    ["2026-10-31T10:00:00Z", "2026-11-01"],
    ["2026-12-31T19:00:00+09:00", "2027-01-01"],
  ])("selects the default date in Korea at %s", (time, expected) => {
    expect(getDefaultMealDate(new Date(time))).toBe(expected);
  });

  it("changes today's date at midnight in Korea", () => {
    expect(getKoreanToday(new Date("2026-10-22T14:59:59Z"))).toBe("2026-10-22");
    expect(getKoreanToday(new Date("2026-10-22T15:00:00Z"))).toBe("2026-10-23");
  });

  it("shows Monday through Sunday even when Sunday is selected", () => {
    expect(getWeekDates("2026-10-25")).toEqual([
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
    ]);
  });

  it("keeps the week together across month and year boundaries", () => {
    const week = getWeekDates("2027-01-01");
    expect(week[0]).toBe("2026-12-28");
    expect(week[6]).toBe("2027-01-03");
    expect(week).toHaveLength(7);
  });

  it("handles leap days when moving between dates", () => {
    expect(shiftDate("2024-02-28", 1)).toBe("2024-02-29");
    expect(shiftDate("2024-03-01", -1)).toBe("2024-02-29");
  });
});
