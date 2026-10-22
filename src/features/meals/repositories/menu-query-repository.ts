import { and, asc, count, desc, eq, inArray, type SQL } from "drizzle-orm";

import type { Database } from "@/lib/db/client";
import { dailyMenuSummaries, importRuns, menuItems } from "@/lib/db/schema";

import type {
  DailyMenuResult,
  MenuPageQuery,
  MenuPageResult,
  MenuQueryStore,
} from "../types";

const menuFields = {
  id: menuItems.id,
  mealDate: menuItems.mealDate,
  mealType: menuItems.mealType,
  menuName: menuItems.menuName,
  calories: menuItems.calories,
  rawCalories: menuItems.rawCalories,
};

export class MenuQueryRepository implements MenuQueryStore {
  constructor(private readonly db: Database) {}

  private findLatestSuccessfulRun(source: string) {
    return this.db
      .select({ completedAt: importRuns.completedAt })
      .from(importRuns)
      .where(
        and(
          eq(importRuns.source, source),
          inArray(importRuns.status, ["COMPLETED", "PARTIALLY_COMPLETED"]),
        ),
      )
      .orderBy(desc(importRuns.completedAt))
      .limit(1);
  }

  async getDailyMenu(source: string, date: string): Promise<DailyMenuResult> {
    const [items, summaries, successfulRuns] = await Promise.all([
      this.db
        .select(menuFields)
        .from(menuItems)
        .where(and(eq(menuItems.source, source), eq(menuItems.mealDate, date)))
        .orderBy(
          asc(menuItems.mealType),
          asc(menuItems.menuName),
          asc(menuItems.id),
        ),
      this.db
        .select({ totalCalories: dailyMenuSummaries.totalCalories })
        .from(dailyMenuSummaries)
        .where(
          and(
            eq(dailyMenuSummaries.source, source),
            eq(dailyMenuSummaries.mealDate, date),
          ),
        )
        .limit(1),
      this.findLatestSuccessfulRun(source),
    ]);

    return {
      items,
      totalCalories: summaries[0]?.totalCalories ?? null,
      lastSuccessfulImportAt: successfulRuns[0]?.completedAt ?? null,
    };
  }

  async getMenuPage(query: MenuPageQuery): Promise<MenuPageResult> {
    const conditions: SQL[] = [eq(menuItems.source, query.source)];
    if (query.date) {
      conditions.push(eq(menuItems.mealDate, query.date));
    }
    const where = and(...conditions);

    const [items, totalResult, latestRuns, successfulRuns] = await Promise.all([
      this.db
        .select(menuFields)
        .from(menuItems)
        .where(where)
        .orderBy(
          desc(menuItems.mealDate),
          asc(menuItems.mealType),
          asc(menuItems.menuName),
        )
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      this.db.select({ value: count() }).from(menuItems).where(where),
      this.db
        .select({
          status: importRuns.status,
          startedAt: importRuns.startedAt,
          completedAt: importRuns.completedAt,
        })
        .from(importRuns)
        .where(eq(importRuns.source, query.source))
        .orderBy(desc(importRuns.startedAt))
        .limit(1),
      this.findLatestSuccessfulRun(query.source),
    ]);

    return {
      items,
      total: totalResult[0]?.value ?? 0,
      latestRun: latestRuns[0] ?? null,
      lastSuccessfulImportAt: successfulRuns[0]?.completedAt ?? null,
    };
  }
}
