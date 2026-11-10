"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import type { LeaveAllowances } from "./schedule-leave";
import { leaveLabels, type LeaveBalances } from "./workdays";

export function LeaveBalancesSummary({
  balances,
  allowances,
  onSave,
}: {
  balances: LeaveBalances;
  allowances: LeaveAllowances;
  onSave: (next: LeaveAllowances) => boolean;
}) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = {
      reward: Number(data.get("reward")),
      consolation: Number(data.get("consolation")),
    };
    if (onSave(next)) {
      setEditing(false);
      setError("");
    } else
      setError(
        "일수를 저장하지 못했습니다. 입력값과 브라우저 저장소 설정을 확인해 주세요.",
      );
  }
  return (
    <section aria-label="남은 휴가" className="mt-8 border-t border-line pt-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-body">남은 휴가</h2>
        <button
          type="button"
          onClick={() => {
            setEditing(!editing);
            setError("");
          }}
          className="min-h-10 text-xs text-muted underline underline-offset-4"
        >
          {editing ? "취소" : "휴가 일수 설정"}
        </button>
      </div>
      <dl className="mt-4 space-y-4">
        {(Object.entries(leaveLabels) as [keyof LeaveBalances, string][]).map(
          ([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="text-base font-medium tabular-nums text-ink">
                {balances[key]}
                <span className="ml-1 text-xs font-normal text-muted">일</span>
              </dd>
            </div>
          ),
        )}
      </dl>
      {editing && (
        <form onSubmit={save} className="mt-4 space-y-3">
          {(
            [
              ["reward", "포상휴가 총일수"],
              ["consolation", "위로휴가 총일수"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              htmlFor={`${id}-${key}`}
              className="block text-xs text-body"
            >
              {label}
              <input
                id={`${id}-${key}`}
                name={key}
                type="number"
                min="0"
                max="999"
                step="1"
                required
                defaultValue={allowances[key]}
                className="mt-1 min-h-12 w-full rounded-md border border-line bg-surface px-3 text-base tabular-nums text-ink"
              />
            </label>
          ))}
          <p className="text-xs leading-5 text-muted">
            사용한 일수를 포함해 지금까지 받은 총일수를 입력하세요.
          </p>
          <button
            type="submit"
            className="min-h-10 w-full rounded-md bg-selected px-3 text-xs font-medium text-selected-foreground"
          >
            일수 저장
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <p className="mt-4 text-xs leading-5 text-muted">
        연가·포상·위로휴가는 일정 등록 시 차감 · 전투휴무는 등록 일수 합산
      </p>
    </section>
  );
}
