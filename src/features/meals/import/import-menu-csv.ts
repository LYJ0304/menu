import { decodeCsv } from "../csv/decoder";
import { parseMenuCsv } from "../csv/parser";
import type {
  CsvParseResult,
  CsvSourceConfig,
  DownloadedCsv,
} from "../csv/types";
import {
  type ImportStore,
  type ImportSkipReason,
  MenuImportExecutionError,
  type MenuImportResult,
} from "../types";

import { prepareImportData } from "./prepare-import-data";

const BATCH_SIZE = 500;
const LOCK_DURATION_MS = 15 * 60 * 1_000;

interface MenuImportDependencies {
  repository: ImportStore;
  sourceConfig: CsvSourceConfig;
  download: (config: CsvSourceConfig) => Promise<DownloadedCsv>;
  decode?: (bytes: Uint8Array) => string;
  parse?: (csvText: string) => CsvParseResult;
  now?: () => Date;
}

function batch<T>(values: T[], size: number): T[][] {
  const batches: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    batches.push(values.slice(index, index + size));
  }
  return batches;
}

async function recordFailure(
  repository: ImportStore,
  result: MenuImportResult,
  fileClaimed: boolean,
): Promise<void> {
  if (result.checksum && fileClaimed) {
    await repository
      .finishFile(result.source, result.checksum, result.runId, "FAILED")
      .catch(() => undefined);
  }

  await repository
    .finishRun(result.runId, {
      status: "FAILED",
      totalRows: result.totalRows,
      importedRows: result.importedRows,
      failedRows: result.failedRows,
      errorMessage: result.message,
    })
    .catch(() => undefined);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 500);
  return "Unknown import failure";
}

export async function importMenuCsv({
  repository,
  sourceConfig,
  download,
  decode = decodeCsv,
  parse = parseMenuCsv,
  now = () => new Date(),
}: MenuImportDependencies): Promise<MenuImportResult> {
  const source = sourceConfig.source;
  const run = await repository.createRun(source);
  let lockAcquired = false;
  let fileClaimed = false;
  let result: MenuImportResult = {
    runId: run.id,
    source,
    status: "FAILED",
    totalRows: 0,
    importedRows: 0,
    failedRows: 0,
  };

  async function skip(reason: ImportSkipReason, message: string) {
    result = { ...result, status: "SKIPPED", skipReason: reason, message };
    await repository.finishRun(run.id, {
      status: "SKIPPED",
      totalRows: 0,
      importedRows: 0,
      failedRows: 0,
      errorMessage: message,
    });
    return result;
  }

  try {
    lockAcquired = await repository.tryAcquireLock(
      source,
      run.id,
      new Date(now().getTime() + LOCK_DURATION_MS),
    );

    if (!lockAcquired) {
      return await skip(
        "SOURCE_LOCKED",
        "Another import for this source is already running",
      );
    }

    const downloaded = await download(sourceConfig);
    result.checksum = downloaded.checksum;
    await repository.setRunChecksum(run.id, downloaded.checksum);

    const claim = await repository.claimFile(
      source,
      downloaded.checksum,
      run.id,
    );

    if (claim === "ALREADY_COMPLETED") {
      return await skip(
        "FILE_PROCESSED",
        "This CSV checksum has already been processed",
      );
    }
    if (claim === "IN_PROGRESS") {
      return await skip(
        "FILE_PROCESSING",
        "This CSV checksum is being processed",
      );
    }

    fileClaimed = true;
    const parsed = parse(decode(downloaded.bytes));
    const prepared = prepareImportData(parsed, source, run.id);

    const completionStatus =
      prepared.failedRows > 0 ? "PARTIALLY_COMPLETED" : "COMPLETED";

    result = {
      ...result,
      status: completionStatus,
      totalRows: parsed.totalRows,
      importedRows: parsed.validRows.length,
      failedRows: prepared.failedRows,
      message: prepared.errorMessage,
    };

    for (const items of batch(prepared.menuItems, BATCH_SIZE)) {
      await repository.upsertMenuItems(items);
    }
    for (const summaries of batch(prepared.summaries, BATCH_SIZE)) {
      await repository.upsertDailySummaries(summaries);
    }

    if (result.status === "COMPLETED") {
      await repository.deleteStaleData(source, run.id);
    }

    await repository.finishFile(
      source,
      downloaded.checksum,
      run.id,
      completionStatus,
    );
    await repository.finishRun(run.id, {
      status: completionStatus,
      totalRows: result.totalRows,
      importedRows: result.importedRows,
      failedRows: result.failedRows,
      errorMessage: result.message,
    });

    return result;
  } catch (error) {
    result = {
      ...result,
      status: "FAILED",
      message: getErrorMessage(error),
    };
    await recordFailure(repository, result, fileClaimed);
    throw new MenuImportExecutionError("Menu CSV import failed", result, {
      cause: error,
    });
  } finally {
    if (lockAcquired) {
      await repository.releaseLock(source, run.id).catch(() => undefined);
    }
  }
}
