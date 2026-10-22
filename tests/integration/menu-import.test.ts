import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { expect, it } from "vitest";
import { ImportRepository } from "@/features/meals/repositories/import-repository";
import { MenuQueryRepository } from "@/features/meals/repositories/menu-query-repository";
import * as schema from "@/lib/db/schema";
import { importMenuCsv } from "@/features/meals/import/import-menu-csv";

it.skipIf(!process.env.TEST_DATABASE_URL)(
  "migrates and imports 9030 meals idempotently in PostgreSQL",
  async () => {
    const client = postgres(process.env.TEST_DATABASE_URL!, { max: 1 });
    const db = drizzle(client, { schema });
    const source = `test:9030:${randomUUID()}`;
    try {
      await migrate(db, { migrationsFolder: "drizzle/migrations" });
      const bytes = new TextEncoder().encode(
        readFileSync("tests/fixtures/9030-sample.csv", "utf8"),
      );
      const repository = new ImportRepository(db);
      const run = (checksum: string) =>
        importMenuCsv({
          repository,
          sourceConfig: { source, url: "https://example.com/9030.csv" },
          download: async () => ({
            bytes,
            checksum,
            contentType: "text/csv",
            byteLength: bytes.length,
          }),
        });

      expect((await run("v1")).status).toBe("COMPLETED");
      const queries = new MenuQueryRepository(db);
      const initial = await queries.getMenuPage({
        source,
        page: 1,
        pageSize: 30,
      });
      expect(initial.total).toBe(7);
      expect((await run("v1")).status).toBe("SKIPPED");
      expect((await run("v2")).status).toBe("COMPLETED");
      const updated = await queries.getMenuPage({
        source,
        page: 1,
        pageSize: 30,
      });
      expect(updated.items.map((item) => item.id).sort()).toEqual(
        initial.items.map((item) => item.id).sort(),
      );
      const [summary] = await db
        .select()
        .from(schema.dailyMenuSummaries)
        .where(
          and(
            eq(schema.dailyMenuSummaries.source, source),
            eq(schema.dailyMenuSummaries.mealDate, "2026-10-22"),
          ),
        );
      expect(summary.totalCalories).toBe("1200.00");
    } finally {
      for (const table of [
        schema.menuItems,
        schema.dailyMenuSummaries,
        schema.importFiles,
        schema.importLocks,
        schema.importRuns,
      ]) {
        await db.delete(table).where(eq(table.source, source));
      }
      await client.end();
    }
  },
  30_000,
);
