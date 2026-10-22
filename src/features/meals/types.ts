export const MND_MENU_SOURCE = "mnd:OA-9561";

export const IMPORT_STATUSES = [
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "SKIPPED",
  "PARTIALLY_COMPLETED",
] as const;

export const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER", "SPECIAL"] as const;

export type ImportStatus = (typeof IMPORT_STATUSES)[number];
export type MealType = (typeof MEAL_TYPES)[number];

export interface MenuItemInput {
  source: string;
  mealDate: string;
  mealType: MealType;
  menuName: string;
  calories: string | null;
  rawCalories: string;
  lastSeenRunId: string;
}

export interface DailyMenuSummaryInput {
  source: string;
  mealDate: string;
  totalCalories: string | null;
  rawTotalCalories: string;
  lastSeenRunId: string;
}

export type FileClaimResult =
  "CLAIMED" | "RETRY_CLAIMED" | "ALREADY_COMPLETED" | "IN_PROGRESS";

export interface CompleteRunInput {
  status: Exclude<ImportStatus, "PROCESSING">;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errorMessage?: string;
}

export interface ImportStore {
  createRun(source: string): Promise<{ id: string }>;
  setRunChecksum(runId: string, checksum: string): Promise<void>;
  finishRun(runId: string, input: CompleteRunInput): Promise<void>;
  tryAcquireLock(
    source: string,
    ownerRunId: string,
    lockedUntil: Date,
  ): Promise<boolean>;
  releaseLock(source: string, ownerRunId: string): Promise<void>;
  claimFile(
    source: string,
    checksum: string,
    runId: string,
  ): Promise<FileClaimResult>;
  finishFile(
    source: string,
    checksum: string,
    runId: string,
    status: "COMPLETED" | "PARTIALLY_COMPLETED" | "FAILED",
  ): Promise<void>;
  upsertMenuItems(items: MenuItemInput[]): Promise<void>;
  upsertDailySummaries(summaries: DailyMenuSummaryInput[]): Promise<void>;
  deleteStaleData(source: string, runId: string): Promise<void>;
}

export type ImportSkipReason =
  "SOURCE_LOCKED" | "FILE_PROCESSED" | "FILE_PROCESSING";

export interface MenuImportResult {
  runId: string;
  source: string;
  checksum?: string;
  status: Exclude<ImportStatus, "PROCESSING">;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  message?: string;
  skipReason?: ImportSkipReason;
}

export class MenuImportExecutionError extends Error {
  constructor(
    message: string,
    public readonly result: MenuImportResult,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "MenuImportExecutionError";
  }
}

export interface MenuPageQuery {
  source: string;
  page: number;
  pageSize: number;
  date?: string;
}

export interface ImportRunSummary {
  status: ImportStatus;
  startedAt: Date;
  completedAt: Date | null;
}

export interface MenuPageResult {
  items: Array<{
    id: string;
    mealDate: string;
    mealType: MealType;
    menuName: string;
    calories: string | null;
    rawCalories: string;
  }>;
  total: number;
  latestRun: ImportRunSummary | null;
  lastSuccessfulImportAt: Date | null;
}

export interface MenuQueryStore {
  getMenuPage(query: MenuPageQuery): Promise<MenuPageResult>;
}
