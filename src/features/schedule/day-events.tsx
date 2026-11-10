"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { sortScheduleEvents, type ScheduleEvent } from "./events";

export function DayEvents({
  date,
  events,
  onSave,
  onRemove,
}: {
  date: string;
  events: ScheduleEvent[];
  onSave: (event: ScheduleEvent) => boolean;
  onRemove: (id: string) => boolean;
}) {
  const id = useId();
  const [editor, setEditor] = useState<ScheduleEvent | "new" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const editing = editor && editor !== "new" ? editor : null;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    if (!title) {
      setError("일정 제목을 입력해 주세요.");
      return;
    }
    const next = {
      id: editing?.id ?? crypto.randomUUID(),
      date,
      title,
      time: String(form.get("time") ?? ""),
      notes: String(form.get("notes") ?? "").trim(),
    };
    if (onSave(next)) {
      setEditor(null);
      setError("");
      setMessage("일정을 저장했습니다.");
    } else {
      setError(
        "일정을 저장하지 못했습니다. 브라우저 저장소 설정과 남은 공간을 확인해 주세요.",
      );
    }
  }

  return (
    <section
      aria-label="선택한 날짜의 일정"
      className="mt-5 border-t border-line pt-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-ink">
          일정 <span className="text-muted">{events.length}</span>
        </h3>
        {!editor && (
          <button
            type="button"
            onClick={() => {
              setEditor("new");
              setError("");
              setMessage("");
            }}
            className="min-h-10 rounded-md border border-line px-3 text-xs text-body hover:bg-canvas"
          >
            일정 추가
          </button>
        )}
      </div>
      {events.length ? (
        <ul className="mt-3 space-y-3">
          {sortScheduleEvents(events).map((event) => (
            <li key={event.id} className="rounded-lg border border-line p-3">
              <p className="text-xs tabular-nums text-accent">
                {event.time || "종일"}
              </p>
              <p className="mt-1 break-words text-sm font-medium text-ink [overflow-wrap:anywhere]">
                {event.title}
              </p>
              {event.notes && (
                <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-muted [overflow-wrap:anywhere]">
                  {event.notes}
                </p>
              )}
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  aria-label={`${event.title} 수정`}
                  onClick={() => {
                    setEditor(event);
                    setError("");
                    setMessage("");
                  }}
                  className="min-h-9 text-xs text-muted underline underline-offset-4"
                >
                  수정
                </button>
                <button
                  type="button"
                  aria-label={`${event.title} 삭제`}
                  onClick={() => {
                    if (!window.confirm(`‘${event.title}’ 일정을 삭제할까요?`))
                      return;
                    if (onRemove(event.id)) {
                      if (editing?.id === event.id) setEditor(null);
                      setError("");
                      setMessage("일정을 삭제했습니다.");
                    } else
                      setError(
                        "일정을 삭제하지 못했습니다. 브라우저 저장소 설정을 확인해 주세요.",
                      );
                  }}
                  className="min-h-9 text-xs text-muted underline underline-offset-4"
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">등록된 일정이 없습니다.</p>
      )}
      {editor && (
        <form
          key={editing?.id ?? "new"}
          onSubmit={save}
          className="mt-4 space-y-3"
        >
          <h4 className="text-sm font-medium text-ink">
            {editing ? "일정 수정" : "새 일정"}
          </h4>
          <label htmlFor={`${id}-title`} className="block text-xs text-body">
            제목 <span className="text-muted">(필수)</span>
            <input
              id={`${id}-title`}
              name="title"
              required
              maxLength={80}
              defaultValue={editing?.title ?? ""}
              className="mt-1 min-h-10 w-full min-w-0 rounded-md border border-line bg-surface px-3 text-sm text-ink"
            />
          </label>
          <label htmlFor={`${id}-time`} className="block text-xs text-body">
            시간 <span className="text-muted">(선택 · 비워두면 종일)</span>
            <input
              id={`${id}-time`}
              name="time"
              type="time"
              defaultValue={editing?.time ?? ""}
              className="mt-1 min-h-10 w-full min-w-0 rounded-md border border-line bg-surface px-3 text-sm text-ink"
            />
          </label>
          <label htmlFor={`${id}-notes`} className="block text-xs text-body">
            메모 <span className="text-muted">(선택)</span>
            <textarea
              id={`${id}-notes`}
              name="notes"
              maxLength={500}
              rows={3}
              defaultValue={editing?.notes ?? ""}
              className="mt-1 w-full min-w-0 rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="min-h-10 flex-1 rounded-md bg-selected px-3 text-xs font-medium text-selected-foreground"
            >
              일정 저장
            </button>
            <button
              type="button"
              onClick={() => {
                setEditor(null);
                setError("");
              }}
              className="min-h-10 rounded-md border border-line px-3 text-xs text-body"
            >
              취소
            </button>
          </div>
        </form>
      )}
      {error && (
        <p
          role="alert"
          className="mt-3 text-xs leading-5 text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
      <p role="status" className="mt-2 text-xs text-body">
        {message}
      </p>
      <p className="mt-4 text-xs leading-5 text-muted">
        일정은 이 브라우저에만 저장됩니다. 브라우저 데이터를 지우면 일정도
        삭제됩니다.
      </p>
    </section>
  );
}
