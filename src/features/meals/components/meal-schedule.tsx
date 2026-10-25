import { RefreshCw } from "lucide-react";
import { formatCalendarDate } from "../calendar";
import { formatCalories, getMealCalories } from "../presentation";
import type { DailyMenuResult } from "../types";
import { MealCard } from "./meal-card";
import { MobileMealTabs } from "./meal-selection";
import { WeekNavigation } from "./week-navigation";

export function MealSchedule({
  today,
  selectedDate,
  menu,
}: {
  today: string;
  selectedDate: string;
  menu: DailyMenuResult | null;
}) {
  const dateLabel = formatCalendarDate(selectedDate, {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const specialItems =
    menu?.items.filter((item) => item.mealType === "SPECIAL") ?? [];
  const specialCalories = getMealCalories(specialItems);
  const cards = (["BREAKFAST", "LUNCH", "DINNER"] as const).map((type) => (
    <MealCard
      key={type}
      type={type}
      items={menu?.items.filter((item) => item.mealType === type) ?? []}
    />
  ));

  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8"
    >
      <h1 className="mb-5 text-2xl font-semibold tracking-tight">식단표</h1>
      <section
        className="order-1 md:order-2 md:mt-6"
        aria-labelledby="daily-heading"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 id="daily-heading" className="text-base font-semibold">
              <time dateTime={selectedDate}>{dateLabel}</time>
            </h2>
            {selectedDate === today && (
              <span className="text-xs font-medium text-accent">오늘</span>
            )}
          </div>
          {menu?.items.length && menu.totalCalories !== null ? (
            <p className="text-xs tabular-nums text-muted">
              총{" "}
              <span className="font-medium text-ink">
                {formatCalories(menu.totalCalories)}
              </span>{" "}
              kcal
            </p>
          ) : null}
        </div>

        {menu === null ? (
          <div
            role="alert"
            className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-line bg-surface px-4 py-8 text-center"
          >
            <h3 className="text-sm font-medium">식단을 불러오지 못했습니다.</h3>
            <p className="mt-2 text-xs text-muted">
              잠시 후 다시 시도해 주세요.
            </p>
            <a
              href={`/?date=${selectedDate}`}
              className="mt-5 flex min-h-10 items-center gap-2 rounded-md border border-line px-3 text-xs font-medium text-body hover:bg-canvas hover:text-ink"
            >
              <RefreshCw className="size-3.5" aria-hidden="true" />
              다시 시도
            </a>
          </div>
        ) : (
          <>
            {!menu.items.length && (
              <p role="status" className="mb-4 text-sm text-muted">
                등록된 식단이 없습니다.
              </p>
            )}
            <MobileMealTabs cards={cards} />
            <div className="hidden grid-cols-3 gap-4 md:grid">
              {cards}
            </div>
            {specialItems.length > 0 && (
              <article
                aria-label="증·특식 식단"
                className="mt-4 flex flex-wrap items-start gap-x-6 gap-y-3 rounded-lg border border-line bg-surface px-5 py-4 text-sm"
              >
                <h3 className="font-medium">증·특식</h3>
                <ul className="flex min-w-0 flex-1 flex-wrap gap-x-5 gap-y-2 text-body">
                  {specialItems.map((item) => (
                    <li className="max-w-full break-words" key={item.id}>
                      {item.menuName}
                    </li>
                  ))}
                </ul>
                {specialCalories !== null && (
                  <p className="text-xs tabular-nums text-muted">
                    {formatCalories(specialCalories)} kcal
                  </p>
                )}
              </article>
            )}
          </>
        )}
      </section>

      <div className="order-2 mt-6 md:order-1 md:mt-0">
        <WeekNavigation today={today} selectedDate={selectedDate} />
      </div>

      <footer className="order-3 mt-8 border-t border-line pt-4 text-xs leading-6 text-muted md:text-[11px] md:leading-5">
        <div className="flex flex-col items-start gap-1 md:flex-row md:justify-between md:gap-x-4">
          <a
            href="https://opendata.mnd.go.kr/openinf/sheetview2.jsp?infId=OA-9561"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-body hover:text-ink"
          >
            국방부 제9030부대 식단 정보<span className="sr-only">(새 창)</span>
          </a>
          <p>
            {menu?.lastSuccessfulImportAt
              ? `업데이트 ${new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(menu.lastSuccessfulImportAt)} (한국시간)`
              : "날짜는 한국시간 기준입니다."}
          </p>
        </div>
        <div className="mt-3 flex flex-col items-start gap-1 md:mt-1">
          <p className="text-pretty">
            실제 제공 메뉴는 부대 사정에 따라 변경될 수 있습니다.
          </p>
          <a
            href="https://github.com/LYJ0304/menu/issues/new"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-ink"
          >
            문의<span className="sr-only">(GitHub 이슈 작성, 새 창)</span>
          </a>
        </div>
        <div className="mt-4 space-y-1 text-center">
          <p>Made by Lee Young Joon</p>
          <p className="tabular-nums">v1.0.4</p>
        </div>
      </footer>
    </main>
  );
}
