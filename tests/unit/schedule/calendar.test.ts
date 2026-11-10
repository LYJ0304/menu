import { describe, expect, it } from "vitest";
import { getMonthDates, shiftMonth } from "@/features/schedule/calendar";
import { getKoreanHolidays } from "@/lib/korean-holidays";

describe("schedule month calendar", () => {
  it("fills complete Sunday-first weeks including neighboring months", () => {
    const dates = getMonthDates("2026-05");
    expect(dates).toHaveLength(42);
    expect(dates[0]).toBe("2026-04-26");
    expect(dates.at(-1)).toBe("2026-06-06");
    expect(new Set(dates).size).toBe(dates.length);
    expect(dates.filter((date) => date.startsWith("2026-05"))).toHaveLength(31);
  });
  it("handles February and leap days", () => {
    expect(getMonthDates("2026-02")).toHaveLength(28);
    expect(getMonthDates("2028-02")).toContain("2028-02-29");
    expect(getMonthDates("2026-02")).not.toContain("2026-02-29");
  });
  it("moves across year boundaries", () => {
    expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    expect(shiftMonth("2026-01", -1)).toBe("2025-12");
  });
  it("labels all lunar holiday days and substitute holidays", () => {
    const holidays = getKoreanHolidays(2026);
    for (const day of ["2026-02-16", "2026-02-17", "2026-02-18"]) {
      expect(holidays.get(day)).toBe("설날");
    }
    expect(holidays.has("2026-02-19")).toBe(false);
    expect(holidays.get("2026-03-02")).toContain("대체공휴일");
    expect(holidays.get("2026-06-03")).toContain("선거일");
  });
});
