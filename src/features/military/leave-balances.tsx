"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { leaveLabels, type LeaveBalances } from "./workdays";

export function LeaveBalancesForm({
  balances,
  onSave,
}: {
  balances: LeaveBalances;
  onSave: (balances: LeaveBalances) => boolean;
}) {
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = { ...balances };
    for (const key of Object.keys(leaveLabels) as (keyof LeaveBalances)[]) {
      const value = Number(form.get(key));
      if (!Number.isInteger(value) || value < 0 || value > 999) return;
      next[key] = value;
    }
    if (onSave(next)) {
      setEditing(false);
      setMessage("남은 휴가를 저장했습니다.");
    } else {
      setMessage(
        "휴가를 저장하지 못했습니다. 브라우저의 저장소 설정을 확인해 주세요.",
      );
    }
  }

  return (
    <section aria-label="남은 휴가" className="mt-8 border-t border-line pt-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-medium text-body">남은 휴가</h2>
        <button
          type="button"
          onClick={() => {
            setEditing(!editing);
            setMessage("");
          }}
          className="min-h-9 text-xs text-muted underline underline-offset-4 hover:text-ink"
        >
          {editing ? "취소" : "휴가 수정"}
        </button>
      </div>
      {editing ? (
        <form onSubmit={save} className="mt-3 space-y-3">
          {(Object.entries(leaveLabels) as [keyof LeaveBalances, string][]).map(
            ([key, label]) => (
              <label
                key={key}
                htmlFor={`${id}-${key}`}
                className="flex items-center justify-between gap-4 text-sm text-body"
              >
                {label}
                <span className="flex items-center gap-2">
                  <input
                    id={`${id}-${key}`}
                    name={key}
                    type="number"
                    min="0"
                    max="999"
                    step="1"
                    required
                    defaultValue={balances[key]}
                    className="min-h-10 w-20 rounded-md border border-line bg-surface px-2 text-right tabular-nums text-ink"
                  />
                  일
                </span>
              </label>
            ),
          )}
          <button
            type="submit"
            className="min-h-10 w-full rounded-md bg-selected px-3 text-xs font-medium text-selected-foreground"
          >
            휴가 저장
          </button>
        </form>
      ) : (
        <dl className="mt-3 space-y-4">
          {(Object.entries(leaveLabels) as [keyof LeaveBalances, string][]).map(
            ([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4"
              >
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="text-base font-medium tabular-nums text-ink">
                  {balances[key]}
                  <span className="ml-1 text-xs font-normal text-muted">
                    일
                  </span>
                </dd>
              </div>
            ),
          )}
        </dl>
      )}
      <p className="mt-4 text-xs leading-5 text-muted">
        평일에 사용할 남은 휴가 일수를 입력하세요. 이 브라우저에만 저장됩니다.
      </p>
      <p role="status" className="mt-2 text-xs text-body">
        {message}
      </p>
    </section>
  );
}
