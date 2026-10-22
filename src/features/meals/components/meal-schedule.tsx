import {
  ArrowUpRight,
  CircleAlert,
  Flame,
  Leaf,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { formatCalendarDate } from "../calendar";
import { formatCalories, getMealCalories } from "../presentation";
import type { DailyMenuResult } from "../types";
import { MealCard } from "./meal-card";
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
  const isToday = selectedDate === today;
  const dateLabel = formatCalendarDate(selectedDate, {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
  const specialItems =
    menu?.items.filter((item) => item.mealType === "SPECIAL") ?? [];
  const specialCalories = getMealCalories(specialItems);

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 pt-8 sm:px-8 sm:pt-12 lg:pt-14"
    >
      <section
        className="mb-8 flex flex-wrap items-end justify-between gap-5 sm:mb-10"
        aria-labelledby="page-heading"
      >
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-forest">
            <span className="h-px w-6 bg-forest" />
            YOUR DAILY MENU
          </p>
          <h1
            id="page-heading"
            className="text-3xl font-bold tracking-tight text-ink sm:text-[42px] sm:leading-tight"
          >
            {isToday
              ? "오늘의 한 끼"
              : `${formatCalendarDate(selectedDate, { month: "long", day: "numeric" })}의 한 끼`}
            <span className="text-forest">.</span>
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted sm:text-[15px]">
            잘 먹고, 힘내는 하루. 우리 부대의 식단을 확인하세요.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-medium text-body">
          <ShieldCheck className="size-4 text-forest" aria-hidden="true" />
          국방부 공개데이터
        </div>
      </section>

      <WeekNavigation today={today} selectedDate={selectedDate} />

      <section className="mt-9 sm:mt-10" aria-labelledby="daily-heading">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id="daily-heading" className="text-lg font-bold tracking-tight">
              {isToday ? "오늘의 식단" : "선택한 날짜의 식단"}
            </h2>
            <time dateTime={selectedDate} className="text-sm text-muted">
              {dateLabel}
            </time>
          </div>
          {menu?.items.length && menu.totalCalories !== null ? (
            <p className="flex items-center gap-1.5 rounded-full bg-sage px-3 py-1.5 text-xs text-forest">
              <Flame className="size-3.5" aria-hidden="true" />
              하루 총열량{" "}
              <strong className="ml-1">
                {formatCalories(menu.totalCalories)} kcal
              </strong>
            </p>
          ) : null}
        </div>

        {menu === null ? (
          <div
            role="alert"
            className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-line bg-white px-5 py-12 text-center"
          >
            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-sage text-forest">
              <CircleAlert className="size-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold">식단을 불러오지 못했어요</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              잠시 후 다시 확인해 주세요.
            </p>
            <a
              href={`/?date=${selectedDate}`}
              className="mt-6 flex min-h-11 items-center gap-2 rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-dark"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              다시 불러오기
            </a>
          </div>
        ) : (
          <>
            {!menu.items.length && (
              <p
                role="status"
                className="mb-5 rounded-xl border border-line bg-white px-4 py-3 text-sm leading-6 text-muted"
              >
                이 날짜의 식단은 아직 등록되지 않았어요. 다른 날짜를 선택해
                보세요.
              </p>
            )}
            <div className="grid gap-4 md:grid-cols-3 lg:gap-5">
              {(["BREAKFAST", "LUNCH", "DINNER"] as const).map((type) => (
                <MealCard
                  key={type}
                  type={type}
                  items={menu.items.filter((item) => item.mealType === type)}
                />
              ))}
            </div>
            {specialItems.length > 0 && (
              <article
                aria-label="증·특식 식단"
                className="mt-5 flex flex-wrap items-start gap-5 rounded-2xl border border-line bg-white p-5 sm:p-6"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-forest">
                  <Sparkles className="size-4" aria-hidden="true" />
                  증·특식
                </div>
                <ul className="flex flex-1 flex-wrap gap-x-5 gap-y-2 text-sm text-body">
                  {specialItems.map((item) => (
                    <li className="break-words" key={item.id}>
                      {item.menuName}
                    </li>
                  ))}
                </ul>
                {specialCalories !== null && (
                  <p className="text-sm font-semibold">
                    {formatCalories(specialCalories)}{" "}
                    <span className="text-xs font-normal text-muted">kcal</span>
                  </p>
                )}
              </article>
            )}
          </>
        )}
      </section>

      <aside className="mt-7 flex items-start gap-3 rounded-2xl bg-sage/70 px-5 py-4 text-xs leading-6 text-forest sm:mt-8">
        <Leaf className="mt-1 size-4 shrink-0" aria-hidden="true" />
        <p>
          균형 잡힌 한 끼로 건강한 하루를 챙기세요.
          <br className="sm:hidden" />{" "}
          <span className="text-muted">
            실제 제공되는 메뉴는 부대 사정에 따라 달라질 수 있어요.
          </span>
        </p>
      </aside>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-[11px] leading-5 text-muted">
        <a
          href="https://opendata.mnd.go.kr/openinf/sheetview2.jsp?infId=OA-9561"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 hover:text-forest"
        >
          출처 · 국방부 제9030부대 식단 정보
          <ArrowUpRight className="size-3" aria-hidden="true" />
          <span className="sr-only">(새 창)</span>
        </a>
        <p>
          {menu?.lastSuccessfulImportAt
            ? `마지막 업데이트 ${new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(menu.lastSuccessfulImportAt)} (한국시간)`
            : "식단 날짜는 한국시간 기준입니다."}
        </p>
      </footer>
    </main>
  );
}
