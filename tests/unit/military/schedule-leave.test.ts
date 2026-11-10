import { describe, expect, it } from "vitest";
import {
  getScheduleLeaveBalances,
  getScheduledLeaveDays,
  parseLeaveAllowances,
} from "@/features/military/schedule-leave";
import type { ScheduleEvent } from "@/features/schedule/events";

const event = (
  id: string,
  category: ScheduleEvent["category"],
  date = "2026-11-10",
): ScheduleEvent => ({ id, date, category, notes: "" });

describe("calendar-derived leave balances", () => {
  it("starts at 24 annual days and zero other days", () => {
    expect(getScheduleLeaveBalances([])).toEqual({
      annual: 24,
      reward: 0,
      consolation: 0,
      combatRest: 0,
    });
  });
  it("deducts annual dates and adds combat rest", () => {
    expect(
      getScheduleLeaveBalances([
        event("1", "연가"),
        event("2", "연가", "2026-11-11"),
        event("3", "포상휴가"),
        event("4", "위로휴가"),
        event("5", "전투휴무"),
        event("6", "당직"),
        event("7", "정기외박"),
        event("8", "식기"),
      ]),
    ).toEqual({ annual: 22, reward: 0, consolation: 0, combatRest: 1 });
  });
  it("counts duplicate dates once per category", () => {
    expect(
      getScheduleLeaveBalances([
        event("1", "연가"),
        event("2", "연가"),
        event("3", "포상휴가"),
        event("4", "포상휴가"),
      ]),
    ).toEqual({ annual: 23, reward: 0, consolation: 0, combatRest: 0 });
  });
  it("recalculates after an edit or deletion", () => {
    const events = [event("1", "연가"), event("2", "전투휴무")];
    expect(getScheduleLeaveBalances(events).annual).toBe(23);
    expect(
      getScheduleLeaveBalances([
        { ...events[0], category: "위로휴가" },
        events[1],
      ]),
    ).toEqual({ annual: 24, reward: 0, consolation: 0, combatRest: 1 });
    expect(getScheduleLeaveBalances(events.slice(1)).annual).toBe(24);
  });
  it("counts all calendar dates and never shows negative annual balances", () => {
    const events = Array.from({ length: 25 }, (_, i) =>
      event(String(i), "연가", `2026-11-${String(i + 1).padStart(2, "0")}`),
    );
    expect(getScheduledLeaveDays(events).annual).toBe(25);
    expect(getScheduleLeaveBalances(events).annual).toBe(0);
  });
  it("subtracts scheduled reward and consolation dates from earned totals", () => {
    const events = [
      event("1", "포상휴가"),
      event("2", "위로휴가"),
      event("3", "포상휴가"),
    ];
    expect(
      getScheduleLeaveBalances(events, { reward: 5, consolation: 3 }),
    ).toEqual({ annual: 24, reward: 4, consolation: 2, combatRest: 0 });
    expect(
      getScheduleLeaveBalances([], { reward: 5, consolation: 3 }).reward,
    ).toBe(5);
    expect(
      getScheduleLeaveBalances(events, { reward: 0, consolation: 0 }).reward,
    ).toBe(0);
    expect(
      getScheduleLeaveBalances([event("1", "연가")], {
        reward: 5,
        consolation: 3,
      }),
    ).toEqual({ annual: 23, reward: 5, consolation: 3, combatRest: 0 });
  });
  it("restores valid earned totals and ignores invalid storage values", () => {
    expect(parseLeaveAllowances('{"reward":5,"consolation":3}')).toEqual({
      reward: 5,
      consolation: 3,
    });
    for (const raw of [
      null,
      "broken",
      '{"reward":-1,"consolation":"4"}',
      '{"reward":1.5,"consolation":1000}',
    ]) {
      expect(parseLeaveAllowances(raw)).toEqual({ reward: 0, consolation: 0 });
    }
  });
});
