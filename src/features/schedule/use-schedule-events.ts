"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  isScheduleEvent,
  parseScheduleEvents,
  type ScheduleEvent,
} from "./events";

import {
  annualLeaveLimit,
  getScheduledLeaveDays,
} from "@/features/military/schedule-leave";

export type SaveScheduleResult = { ok: true } | { ok: false; message: string };

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

function updateEvents(
  change: (events: ScheduleEvent[]) => ScheduleEvent[] | string,
): SaveScheduleResult {
  try {
    // Read immediately before writing so another tab's saved events are kept.
    const latest = parseScheduleEvents(window.localStorage.getItem(storageKey));
    const next = change(latest);
    if (typeof next === "string") return { ok: false, message: next };
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event(changeEvent));
    return { ok: true };
  } catch {
    return {
      ok: false,
      message:
        "일정을 저장하지 못했습니다. 브라우저 저장소 설정과 남은 공간을 확인해 주세요.",
    };
  }
}

export function useScheduleEvents() {
  const raw = useSyncExternalStore(subscribe, readEvents, serverSnapshot);
  const events = useMemo(() => parseScheduleEvents(raw), [raw]);
  return {
    events,
    save: (event: ScheduleEvent): SaveScheduleResult => {
      if (!isScheduleEvent(event))
        return { ok: false, message: "일정 항목과 메모를 확인해 주세요." };
      return updateEvents((latest) => {
        const next = [
          ...latest.filter((saved) => saved.id !== event.id),
          event,
        ];
        if (getScheduledLeaveDays(next).annual > annualLeaveLimit) {
          return "연가는 최대 24일까지 등록할 수 있습니다.";
        }
        return next;
      });
    },
    remove: (id: string) =>
      updateEvents((latest) => latest.filter((event) => event.id !== id)).ok,
  };
}
