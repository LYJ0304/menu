import { redirect } from "next/navigation";
import { getDefaultMealDate, getKoreanToday } from "@/features/meals/calendar";
import { MealSchedule } from "@/features/meals/components/meal-schedule";
import { parseMealDate } from "@/features/meals/date";
import { getDailyMenu } from "@/features/meals/server";
import type { DailyMenuResult } from "@/features/meals/types";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const { date } = await searchParams;
  if (
    date !== undefined &&
    (typeof date !== "string" || parseMealDate(date) !== date)
  ) {
    redirect("/");
  }

  const now = new Date();
  const today = getKoreanToday(now);
  const selectedDate = date ?? getDefaultMealDate(now);
  let menu: DailyMenuResult | null = null;
  try {
    menu = await getDailyMenu(selectedDate);
  } catch {
    console.error("Failed to load daily menu");
  }

  return <MealSchedule today={today} selectedDate={selectedDate} menu={menu} />;
}
