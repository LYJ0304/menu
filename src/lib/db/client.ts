import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");

  const client = postgres(url, {
    max: 1,
    prepare: false,
    connect_timeout: 10,
    idle_timeout: 20,
  });

  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDatabase>;

const globalForDb = globalThis as typeof globalThis & {
  menuDatabase?: ReturnType<typeof createDatabase>;
};

export function getDb() {
  return (globalForDb.menuDatabase ??= createDatabase());
}
