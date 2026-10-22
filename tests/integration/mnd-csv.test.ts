import { expect, it } from "vitest";
import { decodeCsv } from "@/features/meals/csv/decoder";
import { downloadCsv } from "@/features/meals/csv/downloader";
import { parseMenuCsv } from "@/features/meals/csv/parser";
import { getMndMenuSourceConfig } from "@/features/meals/csv/sources/mnd-menu";

it.skipIf(process.env.LIVE_MND !== "1")(
  "downloads and parses the public 9030 CSV",
  async () => {
    const config = getMndMenuSourceConfig();
    const downloaded = await downloadCsv(config);
    const result = parseMenuCsv(decodeCsv(downloaded.bytes));
    expect(result.totalRows).toBeGreaterThan(0);
    expect(result.validRows.length).toBeGreaterThan(0);
    console.info(
      `9030 CSV: ${result.totalRows} rows, ${result.validRows.length} valid, ${result.errors.length} errors`,
    );
  },
  30_000,
);
