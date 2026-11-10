import { describe, expect, it } from "vitest";
import {
  countRemainingWorkdays,
  subtractLeave,
} from "@/features/military/workdays";

describe("remaining workdays in Korea", () => {
  it("includes today, excludes discharge, and skips weekends", () => {
    expect(
      countRemainingWorkdays("2026-01-01", "2026-11-17", "2026-11-13"),
    ).toBe(2);
    expect(
      countRemainingWorkdays("2026-01-01", "2026-11-17", "2026-11-14"),
    ).toBe(1);
  });
  it("starts at enlistment before service and clamps to zero at discharge", () => {
    expect(
      countRemainingWorkdays("2026-11-16", "2026-11-18", "2026-11-10"),
    ).toBe(2);
    expect(
      countRemainingWorkdays("2026-01-01", "2026-11-10", "2026-11-10"),
    ).toBe(0);
    expect(
      countRemainingWorkdays("2026-01-01", "2026-11-10", "2026-11-11"),
    ).toBe(0);
  });
  it("excludes all three Seollal days, without removing the following workday", () => {
    expect(
      countRemainingWorkdays("2026-01-01", "2026-02-20", "2026-02-16"),
    ).toBe(1);
    expect(
      countRemainingWorkdays("2026-01-01", "2026-02-19", "2026-02-16"),
    ).toBe(0);
  });
  it("excludes Chuseok and substitute holidays", () => {
    expect(
      countRemainingWorkdays("2026-01-01", "2026-09-28", "2026-09-24"),
    ).toBe(0);
    expect(
      countRemainingWorkdays("2026-01-01", "2026-03-04", "2026-02-28"),
    ).toBe(1);
    expect(
      countRemainingWorkdays("2026-01-01", "2026-08-19", "2026-08-15"),
    ).toBe(1);
    expect(
      countRemainingWorkdays("2027-01-01", "2027-02-10", "2027-02-06"),
    ).toBe(0);
  });
  it("excludes public election and temporary holidays", () => {
    expect(
      countRemainingWorkdays("2026-01-01", "2026-06-04", "2026-06-03"),
    ).toBe(0);
    expect(
      countRemainingWorkdays("2025-01-01", "2025-01-31", "2025-01-27"),
    ).toBe(0);
  });
  it("handles overlapping holidays only once and includes year boundaries", () => {
    expect(
      countRemainingWorkdays("2025-01-01", "2025-05-08", "2025-05-05"),
    ).toBe(1);
    expect(
      countRemainingWorkdays("2026-01-01", "2027-01-05", "2026-12-31"),
    ).toBe(2);
  });
  it("rejects invalid dates", () => {
    expect(
      countRemainingWorkdays("2026-01-01", "2026-02-30", "2026-01-01"),
    ).toBeNull();
  });
});

describe("leave balances", () => {
  it("subtracts all leave types without producing negative workdays", () => {
    expect(
      subtractLeave(20, {
        annual: 5,
        reward: 2,
        consolation: 3,
        combatRest: 2,
      }),
    ).toBe(8);
    expect(
      subtractLeave(3, { annual: 5, reward: 2, consolation: 3, combatRest: 2 }),
    ).toBe(0);
  });
});
