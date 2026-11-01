import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createCountdownClock } from "@/features/military/use-military-countdown";
import {
  calculateMilitaryCountdown,
  parseStoredServiceDates,
} from "@/features/military/countdown";

let page: EventTarget & { visibilityState: string };
let browser: EventTarget;
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-02T14:59:59Z"));
  page = Object.assign(new EventTarget(), { visibilityState: "visible" });
  browser = new EventTarget();
  vi.stubGlobal("document", page);
  vi.stubGlobal("window", browser);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("countdown clock lifecycle", () => {
  it("has a stable SSR-safe snapshot before subscription", () => {
    const clock = createCountdownClock();
    expect(clock.getSnapshot()).toBeNull();
    expect(clock.getSnapshot()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
  it("refreshes every second and updates D-day at Korean midnight", () => {
    const clock = createCountdownClock();
    const notify = vi.fn();
    const cleanup = clock.subscribe(notify);
    expect(notify).toHaveBeenCalledTimes(1);
    expect(
      calculateMilitaryCountdown(
        "2026-01-01",
        "2026-01-03",
        clock.getSnapshot()!,
      )?.dday,
    ).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(notify).toHaveBeenCalledTimes(2);
    expect(
      calculateMilitaryCountdown(
        "2026-01-01",
        "2026-01-03",
        clock.getSnapshot()!,
      )?.dday,
    ).toBe(0);
    cleanup();
  });
  it("recovers from a delayed tick using actual wall clock time", () => {
    const clock = createCountdownClock();
    const cleanup = clock.subscribe(vi.fn());
    vi.setSystemTime(new Date("2026-01-04T00:00:00Z"));
    vi.advanceTimersByTime(1000);
    expect(clock.getSnapshot()).toBe(Date.now());
    expect(
      calculateMilitaryCountdown(
        "2026-01-01",
        "2026-01-03",
        clock.getSnapshot()!,
      ),
    ).toMatchObject({ progress: 100, seconds: 0 });
    cleanup();
  });
  it("stops when hidden and immediately recalculates on return", () => {
    const clock = createCountdownClock();
    const notify = vi.fn();
    const cleanup = clock.subscribe(notify);
    page.visibilityState = "hidden";
    page.dispatchEvent(new Event("visibilitychange"));
    expect(vi.getTimerCount()).toBe(0);
    const calls = notify.mock.calls.length;
    vi.advanceTimersByTime(60_000);
    expect(notify).toHaveBeenCalledTimes(calls);
    page.visibilityState = "visible";
    page.dispatchEvent(new Event("visibilitychange"));
    expect(clock.getSnapshot()).toBe(Date.now());
    expect(notify).toHaveBeenCalledTimes(calls + 1);
    expect(vi.getTimerCount()).toBe(1);
    cleanup();
  });
  it("does not start a hidden page's timer", () => {
    page.visibilityState = "hidden";
    const clock = createCountdownClock();
    const notify = vi.fn();
    const cleanup = clock.subscribe(notify);
    expect(vi.getTimerCount()).toBe(0);
    expect(notify).not.toHaveBeenCalled();
    cleanup();
  });
  it("handles page cache restoration/focus without duplicate timers and cleans every listener", () => {
    const documentRemove = vi.spyOn(page, "removeEventListener");
    const windowRemove = vi.spyOn(browser, "removeEventListener");
    const clock = createCountdownClock();
    const notify = vi.fn();
    let cleanup = clock.subscribe(notify);
    browser.dispatchEvent(new Event("pagehide"));
    expect(vi.getTimerCount()).toBe(0);
    vi.setSystemTime(new Date("2026-01-05T00:00:00Z"));
    browser.dispatchEvent(new Event("pageshow"));
    browser.dispatchEvent(new Event("focus"));
    expect(clock.getSnapshot()).toBe(Date.now());
    expect(vi.getTimerCount()).toBe(1);
    cleanup();
    expect(vi.getTimerCount()).toBe(0);
    expect(documentRemove.mock.calls.map(([name]) => name)).toEqual([
      "visibilitychange",
    ]);
    expect(windowRemove.mock.calls.map(([name]) => name)).toEqual([
      "focus",
      "pageshow",
      "pagehide",
    ]);
    const calls = notify.mock.calls.length;
    page.dispatchEvent(new Event("visibilitychange"));
    browser.dispatchEvent(new Event("focus"));
    browser.dispatchEvent(new Event("pageshow"));
    vi.advanceTimersByTime(5000);
    expect(notify).toHaveBeenCalledTimes(calls);
    // React Strict Mode subscribes again after its development cleanup.
    cleanup = clock.subscribe(notify);
    expect(vi.getTimerCount()).toBe(1);
    cleanup();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("stored service dates", () => {
  it("validates existing browser data before starting a countdown", () => {
    expect(
      parseStoredServiceDates(
        '{"enlistment":"2026-01-01","discharge":"2026-01-03"}',
      ),
    ).toEqual({ enlistment: "2026-01-01", discharge: "2026-01-03" });
    for (const value of [
      null,
      "",
      "{",
      "null",
      "[]",
      "42",
      '{"enlistment":1}',
      '{"enlistment":"2026-01-03","discharge":"2026-01-01"}',
    ]) {
      expect(parseStoredServiceDates(value)).toBeNull();
    }
  });
});
