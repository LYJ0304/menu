"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseLeaveAllowances, type LeaveAllowances } from "./schedule-leave";

const storageKey = "menu-leave-allowances";
const changeEvent = "menu-leave-allowances-change";
function read() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}
function subscribe(notify: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === storageKey || event.key === null) notify();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, notify);
  };
}
const serverSnapshot = () => null;

export function useLeaveAllowances() {
  const raw = useSyncExternalStore(subscribe, read, serverSnapshot);
  const allowances = useMemo(() => parseLeaveAllowances(raw), [raw]);
  return {
    allowances,
    save: (next: LeaveAllowances) => {
      if (
        !Object.values(next).every(
          (value) => Number.isInteger(value) && value >= 0 && value <= 999,
        )
      )
        return false;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(next));
        window.dispatchEvent(new Event(changeEvent));
        return true;
      } catch {
        return false;
      }
    },
  };
}
