import { describe, expect, it } from "vitest";
import {
  getKoreanToday,
  getWeekDates,
  shiftDate,
} from "@/features/meals/calendar";

describe("meal calendar", () => {
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
