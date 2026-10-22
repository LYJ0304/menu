import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { CsvImportError } from "@/features/meals/csv/errors";
import { parseMenuCsv } from "@/features/meals/csv/parser";

function fixture(name: string): string {
  return readFileSync(resolve("tests/fixtures", name), "utf8");
}

describe("parseMenuCsv", () => {
  it("inherits dates on 9030 continuation rows and accepts unitless calories", () => {
    const result = parseMenuCsv(fixture("9030-sample.csv"));
    expect(result.errors).toEqual([]);
    expect(result.validRows.map((row) => row.mealDate)).toEqual([
      "2026-10-22",
      "2026-10-22",
      "2026-10-23",
    ]);
    expect(result.validRows[0].items[0].calories).toBe("300");
  });

  it("does not inherit an earlier date after an explicitly invalid date", () => {
    const lines = fixture("9030-sample.csv").trim().split("\n");
    const result = parseMenuCsv(
      [
        lines[0],
        lines[1],
        lines[2].replace(/^,/, "2026-02-30,"),
        lines[2],
      ].join("\n"),
    );
    expect(
      result.errors.filter((error) => error.field === "날짜"),
    ).toHaveLength(2);
    expect(result.validRows).toHaveLength(1);
  });

  it("parses a valid CSV and normalizes weekday dates", () => {
    const result = parseMenuCsv(fixture("valid-sample.csv"));

    expect(result.totalRows).toBe(2);
    expect(result.validRows).toHaveLength(2);
    expect(result.validRows[0].mealDate).toBe("2026-05-01");
    expect(result.validRows[0].items[1]).toMatchObject({
      mealType: "LUNCH",
      menuName: "소고기, 채소볶음",
      calories: "412.5",
    });
    expect(result.errors).toEqual([]);
  });

  it("accepts a UTF-8 BOM", () => {
    const result = parseMenuCsv(`\uFEFF${fixture("valid-sample.csv")}`);

    expect(result.validRows).toHaveLength(2);
  });

  it("rejects missing required columns", () => {
    expect(() => parseMenuCsv(fixture("invalid-columns.csv"))).toThrowError(
      CsvImportError,
    );

    try {
      parseMenuCsv(fixture("invalid-columns.csv"));
    } catch (error) {
      expect(error).toMatchObject({ code: "INVALID_HEADERS" });
    }
  });

  it("preserves a comma inside a quoted field", () => {
    const result = parseMenuCsv(fixture("valid-sample.csv"));

    expect(result.validRows[0].items[1].menuName).toBe("소고기, 채소볶음");
  });

  it("collects invalid date and calorie row errors", () => {
    const result = parseMenuCsv(fixture("malformed-row.csv"));

    expect(result.totalRows).toBe(2);
    expect(result.validRows).toHaveLength(0);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "날짜", value: "2026-02-30" }),
        expect.objectContaining({ field: "조식열량", value: "175ml" }),
      ]),
    );
  });

  it("rejects an empty CSV", () => {
    expect(() => parseMenuCsv(" \n")).toThrowError(
      expect.objectContaining({ code: "EMPTY_FILE" }),
    );
  });
});
