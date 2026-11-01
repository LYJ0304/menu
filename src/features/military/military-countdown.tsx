"use client";

import { useId, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import { formatCalendarDate } from "@/features/meals/calendar";
import {
  calculateMilitaryCountdown,
  parseStoredServiceDates,
} from "./countdown";
import { useMilitaryCountdown } from "./use-military-countdown";

const storageKey = "menu-service-dates";
const changeEvent = "menu-service-dates-change";
function readDates() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}
function subscribeDates(notify: () => void) {
  window.addEventListener("storage", notify);
  window.addEventListener(changeEvent, notify);
  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener(changeEvent, notify);
  };
}
const serverDates = () => null;

export function MilitaryCountdown() {
  const id = useId();
  const raw = useSyncExternalStore(subscribeDates, readDates, serverDates);
  const dates = parseStoredServiceDates(raw);
  const countdown = useMilitaryCountdown(
    dates?.enlistment ?? "",
    dates?.discharge ?? "",
  );
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const enlistment = String(form.get("enlistment") ?? "");
    const discharge = String(form.get("discharge") ?? "");
    if (!calculateMilitaryCountdown(enlistment, discharge)) {
      setError(
        "입대일과 전역일을 확인해 주세요. 전역일은 입대일보다 늦어야 합니다.",
      );
      return;
    }
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ enlistment, discharge }),
      );
      window.dispatchEvent(new Event(changeEvent));
      setError("");
      setEditing(false);
    } catch {
      setError(
        "날짜를 저장하지 못했습니다. 브라우저의 저장소 설정을 확인해 주세요.",
      );
    }
  }

  function reset() {
    try {
      window.localStorage.removeItem(storageKey);
      window.dispatchEvent(new Event(changeEvent));
      setError("");
      setEditing(false);
    } catch {
      setError("저장된 날짜를 삭제하지 못했습니다.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:gap-12">
      <section aria-label="전역일 카운트다운" className="w-full md:max-w-xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-medium text-body">전역까지</h2>
          {dates && (
            <button
              type="button"
              onClick={() => {
                setEditing(!editing);
                setError("");
              }}
              className="min-h-9 text-xs text-muted underline underline-offset-4 hover:text-ink"
            >
              {editing ? "닫기" : "날짜 수정"}
            </button>
          )}
        </div>
        {countdown && (
          <>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-2 tabular-nums">
              <p className="min-w-[7ch] text-2xl font-semibold tracking-tight text-accent">
                D-{countdown.dday}
              </p>
              <p
                aria-label="전역까지 남은 시간"
                className="flex gap-2 whitespace-nowrap text-sm text-body sm:gap-3"
              >
                {(
                  [
                    [countdown.days, "일"],
                    [countdown.hours, "시간"],
                    [countdown.minutes, "분"],
                    [countdown.seconds, "초"],
                  ] as const
                ).map(([value, label]) => (
                  <span key={label}>
                    <span
                      className={`inline-block text-right font-medium text-ink ${label === "일" ? "min-w-[3ch]" : "min-w-[2ch]"}`}
                    >
                      {String(value).padStart(2, "0")}
                    </span>
                    <span className="ml-1 text-xs">{label}</span>
                  </span>
                ))}
              </p>
            </div>
            <div className="mt-3 flex justify-between gap-4 text-xs text-muted">
              <span>복무 진행률</span>
              <span className="min-w-[12ch] text-right tabular-nums text-ink">
                {countdown.progress.toFixed(6)}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="복무 진행률"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={countdown.progress}
              aria-valuetext={`${countdown.progress.toFixed(6)}%`}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-line"
            >
              <div
                className="h-full bg-accent"
                style={{ width: `${countdown.progress}%` }}
              />
            </div>
          </>
        )}
        {(!dates || editing) && (
          <form key={raw} onSubmit={save} className="mt-3">
            <div className="flex flex-wrap items-end gap-3">
              {(
                [
                  ["enlistment", "입대일"],
                  ["discharge", "전역일"],
                ] as const
              ).map(([name, label]) => (
                <label
                  key={name}
                  htmlFor={`${id}-${name}`}
                  className="min-w-0 flex-1 text-xs text-body"
                >
                  {label}
                  <input
                    id={`${id}-${name}`}
                    name={name}
                    type="date"
                    required
                    defaultValue={dates?.[name] ?? ""}
                    aria-describedby={`${id}-policy`}
                    className="mt-1 block min-h-10 w-full min-w-0 rounded-md border border-line bg-surface px-2 text-sm text-ink"
                  />
                </label>
              ))}
              <button
                type="submit"
                className="min-h-10 rounded-md bg-selected px-3 text-xs font-medium text-selected-foreground"
              >
                저장
              </button>
              {dates && (
                <button
                  type="button"
                  onClick={reset}
                  className="min-h-10 text-xs text-muted underline underline-offset-4"
                >
                  초기화
                </button>
              )}
            </div>
            <p
              id={`${id}-policy`}
              className="mt-2 text-xs leading-5 text-muted"
            >
              이 브라우저에 저장됩니다. 날짜는 한국시간 00:00 기준입니다.
            </p>
          </form>
        )}
        {raw && !dates && (
          <p className="mt-2 text-xs text-muted">
            저장된 날짜가 올바르지 않습니다. 다시 입력해 주세요.
          </p>
        )}
        {error && (
          <p role="alert" className="mt-2 text-xs text-body">
            {error}
          </p>
        )}
      </section>
      {dates && (
        <dl
          aria-label="복무 기간"
          className="space-y-6 border-t border-line pt-6 lg:border-t-0 lg:border-l lg:pt-1 lg:pl-8"
        >
          {(
            [
              ["입대일", dates.enlistment],
              ["전역일", dates.discharge],
            ] as const
          ).map(([label, date]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-2 text-base font-medium tabular-nums text-ink">
                <time dateTime={date}>
                  {formatCalendarDate(date, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
