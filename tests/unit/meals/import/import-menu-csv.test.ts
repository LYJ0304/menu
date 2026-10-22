import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import type { DownloadedCsv } from "@/features/meals/csv/types";
import { importMenuCsv } from "@/features/meals/import/import-menu-csv";
import type {
  CompleteRunInput,
  FileClaimResult,
  ImportStore,
  DailyMenuSummaryInput,
  MenuItemInput,
} from "@/features/meals/types";

class FakeImportStore implements ImportStore {
  runs = new Map<string, CompleteRunInput | undefined>();
  files = new Map<
    string,
    "PROCESSING" | "COMPLETED" | "PARTIALLY_COMPLETED" | "FAILED"
  >();
  menuItems = new Map<string, MenuItemInput>();
  summaries = new Map<string, DailyMenuSummaryInput>();
  locked = false;
  failMenuUpsert = false;
  fileInProgress = false;
  staleDeleteCalls = 0;
  private runSequence = 0;

  async createRun(): Promise<{ id: string }> {
    const id = `run-${++this.runSequence}`;
    this.runs.set(id, undefined);
    return { id };
  }

  async setRunChecksum(): Promise<void> {}

  async finishRun(runId: string, input: CompleteRunInput): Promise<void> {
    this.runs.set(runId, input);
  }

  async tryAcquireLock(): Promise<boolean> {
    if (this.locked) return false;
    this.locked = true;
    return true;
  }

  async releaseLock(): Promise<void> {
    this.locked = false;
  }

  async claimFile(source: string, checksum: string): Promise<FileClaimResult> {
    const key = `${source}:${checksum}`;
    const status = this.files.get(key);

    if (status === "COMPLETED" || status === "PARTIALLY_COMPLETED") {
      return "ALREADY_COMPLETED";
    }
    if (this.fileInProgress) return "IN_PROGRESS";

    this.files.set(key, "PROCESSING");
    return status ? "RETRY_CLAIMED" : "CLAIMED";
  }

  async finishFile(
    source: string,
    checksum: string,
    _runId: string,
    status: "COMPLETED" | "PARTIALLY_COMPLETED" | "FAILED",
  ): Promise<void> {
    this.files.set(`${source}:${checksum}`, status);
  }

  async upsertMenuItems(items: MenuItemInput[]): Promise<void> {
    if (this.failMenuUpsert) throw new Error("database unavailable");

    for (const item of items) {
      const key = [
        item.source,
        item.mealDate,
        item.mealType,
        item.menuName,
        item.rawCalories,
      ].join(":");
      this.menuItems.set(key, item);
    }
  }

  async upsertDailySummaries(
    summaries: DailyMenuSummaryInput[],
  ): Promise<void> {
    for (const summary of summaries) {
      this.summaries.set(`${summary.source}:${summary.mealDate}`, summary);
    }
  }

  async deleteStaleData(): Promise<void> {
    this.staleDeleteCalls += 1;
  }
}

const sourceConfig = {
  source: "test:menus",
  url: "https://example.com/menus.csv",
};

function fixtureBytes(): Uint8Array {
  return new TextEncoder().encode(
    readFileSync(resolve("tests/fixtures/valid-sample.csv"), "utf8"),
  );
}

function downloaded(checksum: string): DownloadedCsv {
  const bytes = fixtureBytes();
  return {
    bytes,
    checksum,
    contentType: "text/csv",
    byteLength: bytes.byteLength,
  };
}

describe("importMenuCsv", () => {
  it("skips a locked source without downloading or releasing another run's lock", async () => {
    const repository = new FakeImportStore();
    repository.locked = true;
    const result = await importMenuCsv({
      repository,
      sourceConfig,
      download: async () => {
        throw new Error("must not download");
      },
    });
    expect(result).toMatchObject({
      status: "SKIPPED",
      skipReason: "SOURCE_LOCKED",
    });
    expect(repository.locked).toBe(true);
    expect(repository.runs.get(result.runId)?.status).toBe("SKIPPED");
  });

  it("skips an in-progress file and releases its source lock", async () => {
    const repository = new FakeImportStore();
    repository.fileInProgress = true;
    const result = await importMenuCsv({
      repository,
      sourceConfig,
      download: async () => downloaded("processing"),
    });
    expect(result).toMatchObject({
      status: "SKIPPED",
      skipReason: "FILE_PROCESSING",
    });
    expect(repository.menuItems.size).toBe(0);
    expect(repository.locked).toBe(false);
  });

  it("records download failures and releases the lock", async () => {
    const repository = new FakeImportStore();
    await expect(
      importMenuCsv({
        repository,
        sourceConfig,
        download: async () => {
          throw new Error("network unavailable");
        },
      }),
    ).rejects.toMatchObject({ result: { status: "FAILED" } });
    expect(repository.runs.get("run-1")).toMatchObject({
      status: "FAILED",
      errorMessage: "network unavailable",
    });
    expect(repository.files.size).toBe(0);
    expect(repository.locked).toBe(false);
  });

  it("preserves existing data when only some rows are valid", async () => {
    const repository = new FakeImportStore();
    const valid = readFileSync(
      resolve("tests/fixtures/valid-sample.csv"),
      "utf8",
    ).trim();
    const invalid = readFileSync(
      resolve("tests/fixtures/malformed-row.csv"),
      "utf8",
    )
      .trim()
      .split("\n")
      .slice(1)
      .join("\n");
    const bytes = new TextEncoder().encode(`${valid}\n${invalid}`);
    const result = await importMenuCsv({
      repository,
      sourceConfig,
      download: async () => ({
        bytes,
        checksum: "partial",
        contentType: "text/csv",
        byteLength: bytes.length,
      }),
    });
    expect(result).toMatchObject({
      status: "PARTIALLY_COMPLETED",
      totalRows: 4,
      importedRows: 2,
      failedRows: 2,
    });
    expect(repository.staleDeleteCalls).toBe(0);
    expect(repository.locked).toBe(false);
  });

  it("keeps daily totals when 9030 continuation rows omit them", async () => {
    const repository = new FakeImportStore();
    const bytes = new TextEncoder().encode(
      readFileSync(resolve("tests/fixtures/9030-sample.csv"), "utf8"),
    );
    const result = await importMenuCsv({
      repository,
      sourceConfig,
      download: async () => ({
        bytes,
        checksum: "9030",
        contentType: "text/csv",
        byteLength: bytes.length,
      }),
    });
    expect(result.status).toBe("COMPLETED");
    expect(repository.menuItems.size).toBe(7);
    expect(
      repository.summaries.get("test:menus:2026-10-22")?.totalCalories,
    ).toBe("1200");
  });

  it("skips a checksum that was already completed", async () => {
    const repository = new FakeImportStore();
    const download = async () => downloaded("same-checksum");

    const first = await importMenuCsv({
      repository,
      sourceConfig,
      download,
    });
    const second = await importMenuCsv({
      repository,
      sourceConfig,
      download,
    });

    expect(first.status).toBe("COMPLETED");
    expect(second.status).toBe("SKIPPED");
    expect(second.skipReason).toBe("FILE_PROCESSED");
    expect(repository.menuItems.size).toBe(4);
    expect(repository.runs.get(second.runId)?.status).toBe("SKIPPED");
  });

  it("upserts idempotently when changed files contain the same rows", async () => {
    const repository = new FakeImportStore();
    const checksums = ["checksum-v1", "checksum-v2"];

    for (const checksum of checksums) {
      await importMenuCsv({
        repository,
        sourceConfig,
        download: async () => downloaded(checksum),
      });
    }

    expect(repository.menuItems.size).toBe(4);
    expect(repository.summaries.size).toBe(2);
    expect(repository.staleDeleteCalls).toBe(2);
  });

  it("marks the file and run failed when a DB batch upsert fails", async () => {
    const repository = new FakeImportStore();
    repository.failMenuUpsert = true;

    await expect(
      importMenuCsv({
        repository,
        sourceConfig,
        download: async () => downloaded("failed-checksum"),
      }),
    ).rejects.toMatchObject({
      name: "MenuImportExecutionError",
      result: { status: "FAILED" },
    });

    expect(repository.files.get("test:menus:failed-checksum")).toBe("FAILED");
    expect(repository.runs.get("run-1")).toMatchObject({
      status: "FAILED",
      errorMessage: "database unavailable",
    });
    expect(repository.locked).toBe(false);
  });
});
