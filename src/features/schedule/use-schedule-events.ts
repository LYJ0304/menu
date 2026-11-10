"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  isScheduleEvent,
  parseScheduleEvents,
  type ScheduleEvent,
} from "./events";

const storageKey = "menu-schedule-events";
const changeEvent = "menu-schedule-events-change";

function readEvents() {
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

function updateEvents(change: (events: ScheduleEvent[]) => ScheduleEvent[]) {
  try {
    // Read immediately before writing so another tab's saved events are kept.
    const latest = parseScheduleEvents(window.localStorage.getItem(storageKey));
    window.localStorage.setItem(storageKey, JSON.stringify(change(latest)));
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch {
    return false;
  }
}

export function useScheduleEvents() {
  const raw = useSyncExternalStore(subscribe, readEvents, serverSnapshot);
  const events = useMemo(() => parseScheduleEvents(raw), [raw]);
  return {
    events,
    save: (event: ScheduleEvent) =>
      isScheduleEvent(event) &&
      updateEvents((latest) => [
        ...latest.filter((saved) => saved.id !== event.id),
        event,
      ]),
    remove: (id: string) =>
      updateEvents((latest) => latest.filter((event) => event.id !== id)),
  };
}
