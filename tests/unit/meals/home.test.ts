import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/features/meals/server", () => ({ getDailyMenu: vi.fn() }));

import Home from "@/app/page";
import { getDailyMenu } from "@/features/meals/server";

const empty = { items: [], totalCalories: null, lastSuccessfulImportAt: null };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-22T15:00:00Z"));
  vi.mocked(getDailyMenu).mockReset().mockResolvedValue(empty);
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("meal home", () => {
  it("loads today's meals using the Korean date", async () => {
    const page = await Home({ searchParams: Promise.resolve({}) });
    expect(getDailyMenu).toHaveBeenCalledWith("2026-10-23");
    expect(page.props).toMatchObject({
      today: "2026-10-23",
      selectedDate: "2026-10-23",
      menu: empty,
    });
  });

  it("loads the date selected through the URL", async () => {
    vi.setSystemTime(new Date("2026-10-23T19:00:00+09:00"));
    const page = await Home({
      searchParams: Promise.resolve({ date: "2026-10-21" }),
    });
    expect(getDailyMenu).toHaveBeenCalledWith("2026-10-21");
    expect(page.props.selectedDate).toBe("2026-10-21");
  });

  it.each([
    ["2026-10-23T18:59:59+09:00", "2026-10-23", "2026-10-23"],
    ["2026-10-23T19:00:00+09:00", "2026-10-23", "2026-10-24"],
    ["2026-10-23T23:59:59+09:00", "2026-10-23", "2026-10-24"],
    ["2026-10-24T00:00:00+09:00", "2026-10-24", "2026-10-24"],
    ["2026-12-31T19:00:00+09:00", "2026-12-31", "2027-01-01"],
  ])("loads the default date at %s", async (time, today, selectedDate) => {
    vi.setSystemTime(new Date(time));
    const page = await Home({ searchParams: Promise.resolve({}) });
    expect(getDailyMenu).toHaveBeenCalledWith(selectedDate);
    expect(page.props).toMatchObject({ today, selectedDate });
  });

  it.each([
    "2026-02-30",
    "2026-10-22(목)",
    "invalid",
    ["2026-10-21", "2026-10-22"],
  ])("redirects invalid dates before querying the DB: %s", async (date) => {
    await expect(
      Home({ searchParams: Promise.resolve({ date }) }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(getDailyMenu).not.toHaveBeenCalled();
  });

  it("distinguishes a DB failure from an empty day's menu", async () => {
    vi.mocked(getDailyMenu).mockRejectedValue(
      new Error("database password secret"),
    );
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const page = await Home({ searchParams: Promise.resolve({}) });
    expect(page.props.menu).toBeNull();
    expect(log).toHaveBeenCalledWith("Failed to load daily menu");
  });
});
