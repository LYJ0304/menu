import { handleCronImport } from "@/features/meals/http/cron-import";
import { importMndMenuCsv } from "@/features/meals/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export function GET(request: Request): Promise<Response> {
  return handleCronImport(request, importMndMenuCsv);
}
