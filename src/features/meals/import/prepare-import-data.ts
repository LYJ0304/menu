import type { CsvParseResult } from "../csv/types";
import type { MenuItemInput, DailyMenuSummaryInput } from "../types";

function menuBusinessKey(item: MenuItemInput): string {
  return [
    item.source,
    item.mealDate,
    item.mealType,
    item.menuName,
    item.rawCalories,
  ].join("\u001f");
}

export function prepareImportData(
  parsed: CsvParseResult,
  source: string,
  runId: string,
): {
  menuItems: MenuItemInput[];
  summaries: DailyMenuSummaryInput[];
  failedRows: number;
  errorMessage?: string;
} {
  const uniqueItems = new Map<string, MenuItemInput>();
  const summaries = new Map<string, DailyMenuSummaryInput>();

  for (const row of parsed.validRows) {
    for (const item of row.items) {
      const record: MenuItemInput = {
        source,
        mealDate: row.mealDate,
        mealType: item.mealType,
        menuName: item.menuName,
        calories: item.calories,
        rawCalories: item.rawCalories,
        lastSeenRunId: runId,
      };
      uniqueItems.set(menuBusinessKey(record), record);
    }

    const existingSummary = summaries.get(row.mealDate);
    summaries.set(row.mealDate, {
      source,
      mealDate: row.mealDate,
      totalCalories:
        row.totalCalories ?? existingSummary?.totalCalories ?? null,
      rawTotalCalories:
        row.rawTotalCalories || existingSummary?.rawTotalCalories || "",
      lastSeenRunId: runId,
    });
  }

  const failedRowNumbers = [
    ...new Set(parsed.errors.map((error) => error.rowNumber)),
  ];
  const errorSamples = parsed.errors
    .slice(0, 10)
    .map((error) => `row ${error.rowNumber} ${error.field}: ${error.message}`);

  return {
    menuItems: [...uniqueItems.values()],
    summaries: [...summaries.values()],
    failedRows: failedRowNumbers.length,
    errorMessage:
      errorSamples.length > 0
        ? `${failedRowNumbers.length} row(s) rejected; ${errorSamples.join("; ")}`
        : undefined,
  };
}
