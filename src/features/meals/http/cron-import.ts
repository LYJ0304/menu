import { verifyCronRequest } from "@/lib/auth/verify-cron";
import { MenuImportExecutionError, type MenuImportResult } from "../types";

type ImportRunner = () => Promise<MenuImportResult>;

export async function handleCronImport(
  request: Request,
  runImport: ImportRunner,
  cronSecret: string | undefined = process.env.CRON_SECRET,
): Promise<Response> {
  const auth = verifyCronRequest(request, cronSecret);

  if (!auth.ok) {
    const misconfigured = auth.reason === "MISCONFIGURED";
    return Response.json(
      {
        error: misconfigured
          ? "Cron authentication is not configured"
          : "Unauthorized",
      },
      { status: misconfigured ? 500 : 401 },
    );
  }

  try {
    const result = await runImport();
    const { skipReason, ...body } = result;
    return Response.json(body, {
      status: skipReason === "SOURCE_LOCKED" ? 409 : 200,
    });
  } catch (error) {
    if (error instanceof MenuImportExecutionError) {
      return Response.json(
        {
          status: "FAILED",
          runId: error.result.runId,
          source: error.result.source,
          checksum: error.result.checksum,
          message: "CSV import failed",
        },
        { status: 500 },
      );
    }

    return Response.json(
      { status: "FAILED", message: "CSV import failed" },
      { status: 500 },
    );
  }
}
