import { handleDataRequest } from "@/features/meals/http/menu-data";
import { menuQueries } from "@/features/meals/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request): Promise<Response> {
  return handleDataRequest(request, menuQueries);
}
