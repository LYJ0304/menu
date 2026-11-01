"use client";

import { useMemo, useSyncExternalStore } from "react";
import { calculateMilitaryCountdown } from "./countdown";

// Each mounted countdown owns its clock; no browser APIs run during SSR.
export function createCountdownClock() {
  let now: number | null = null;
  return {
    getSnapshot: () => now,
    subscribe: (notify: () => void) => {
      let timer: ReturnType<typeof setInterval> | undefined;
      const tick = () => {
        now = Date.now();
        notify();
      };
      const stop = () => {
        clearInterval(timer);
        timer = undefined;
      };
      const resume = () => {
        stop();
        if (document.visibilityState === "hidden") return;
        tick();
        timer = setInterval(tick, 1000);
      };
      document.addEventListener("visibilitychange", resume);
      window.addEventListener("focus", resume);
      window.addEventListener("pageshow", resume);
      window.addEventListener("pagehide", stop);
      resume();
      return () => {
        stop();
        document.removeEventListener("visibilitychange", resume);
        window.removeEventListener("focus", resume);
        window.removeEventListener("pageshow", resume);
        window.removeEventListener("pagehide", stop);
      };
    },
  };
}

const serverSnapshot = () => null;
const noSubscription = () => () => {};

export function useMilitaryCountdown(enlistment: string, discharge: string) {
  const clock = useMemo(() => createCountdownClock(), []);
  const valid = calculateMilitaryCountdown(enlistment, discharge, 0) !== null;
  const now = useSyncExternalStore(
    valid ? clock.subscribe : noSubscription,
    clock.getSnapshot,
    serverSnapshot,
  );
  return now === null
    ? null
    : calculateMilitaryCountdown(enlistment, discharge, now);
}
