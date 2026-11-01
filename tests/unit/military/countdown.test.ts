import { describe, expect, it } from "vitest";
import { calculateMilitaryCountdown } from "@/features/military/countdown";

const start = "2026-01-01";
const end = "2026-01-03";
const at = (time: string) => Date.parse(time);

describe("military countdown (Asia/Seoul)", () => {
  it("clamps progress before enlistment", () => {
    expect(
      calculateMilitaryCountdown(start, end, at("2025-12-31T23:00:00+09:00"))
        ?.progress,
    ).toBe(0);
  });
  it("calculates exact elapsed progress and remaining day/time parts", () => {
    expect(
      calculateMilitaryCountdown(start, end, at("2026-01-01T12:00:00+09:00")),
    ).toEqual({
      dday: 2,
      days: 1,
      hours: 12,
      minutes: 0,
      seconds: 0,
      progress: 25,
    });
    expect(
      calculateMilitaryCountdown(start, end, at("2026-01-01T12:00:01+09:00"))!
        .progress,
    ).toBeGreaterThan(25);
  });
  it("uses Korean midnight for D-day, independently of remaining full days", () => {
    const before = calculateMilitaryCountdown(
      start,
      end,
      at("2026-01-02T14:59:59Z"),
    );
    const after = calculateMilitaryCountdown(
      start,
      end,
      at("2026-01-02T15:00:00Z"),
    );
    expect(before).toMatchObject({ dday: 1, days: 0, seconds: 1 });
    expect(after).toMatchObject({
      dday: 0,
      progress: 100,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });
  it("clamps time and progress after discharge", () => {
    expect(
      calculateMilitaryCountdown(start, end, at("2027-01-01T00:00:00Z")),
    ).toEqual({
      dday: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progress: 100,
    });
  });
  it("does not show zero seconds before the discharge instant", () => {
    expect(
      calculateMilitaryCountdown(
        start,
        end,
        at("2026-01-02T23:59:59.900+09:00"),
      )?.seconds,
    ).toBe(1);
  });
  it("handles leap days and year boundaries", () => {
    expect(
      calculateMilitaryCountdown(
        "2027-12-31",
        "2028-03-01",
        at("2028-02-28T15:00:00Z"),
      )?.dday,
    ).toBe(1);
  });
  it.each([
    ["invalid", end],
    [start, "2026-02-30"],
    [start, start],
    [end, start],
    ["2026-01-01T00:00:00Z", end],
    [start, " 2026-01-03"],
    ["", end],
  ])("rejects invalid dates/order: %s, %s", (enlistment, discharge) => {
    expect(calculateMilitaryCountdown(enlistment, discharge, 0)).toBeNull();
  });
  it("rejects non-finite current time", () => {
    expect(calculateMilitaryCountdown(start, end, NaN)).toBeNull();
  });
});
