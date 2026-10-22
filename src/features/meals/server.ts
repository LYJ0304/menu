import "server-only";

import { getDb } from "@/lib/db/client";
import { downloadCsv } from "./csv/downloader";
import { getMndMenuSourceConfig } from "./csv/sources/mnd-menu";
import { importMenuCsv } from "./import/import-menu-csv";
import { ImportRepository } from "./repositories/import-repository";
import { MenuQueryRepository } from "./repositories/menu-query-repository";
import { MND_MENU_SOURCE, type MenuQueryStore } from "./types";

export function importMndMenuCsv() {
  return importMenuCsv({
    repository: new ImportRepository(getDb()),
    sourceConfig: getMndMenuSourceConfig(),
    download: downloadCsv,
  });
}

export const menuQueries: MenuQueryStore = {
  getMenuPage: (query) => new MenuQueryRepository(getDb()).getMenuPage(query),
};

export function getDailyMenu(date: string) {
  return new MenuQueryRepository(getDb()).getDailyMenu(MND_MENU_SOURCE, date);
}
