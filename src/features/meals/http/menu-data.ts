import { z } from "zod";

import { parseMealDate } from "../date";
import { MND_MENU_SOURCE, type MenuQueryStore } from "../types";

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => parseMealDate(value) !== null, "Invalid calendar date")
    .optional(),
});

export async function handleDataRequest(
  request: Request,
  repository: MenuQueryStore,
): Promise<Response> {
  const url = new URL(request.url);
  const parsedQuery = querySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    pageSize: url.searchParams.get("pageSize") ?? undefined,
    date: url.searchParams.get("date") ?? undefined,
  });

  if (!parsedQuery.success) {
    return Response.json(
      {
        error: "Invalid query parameters",
        fields: parsedQuery.error.issues.map((issue) => issue.path.join(".")),
      },
      { status: 400 },
    );
  }

  try {
    const result = await repository.getMenuPage({
      source: MND_MENU_SOURCE,
      ...parsedQuery.data,
    });
    const totalPages =
      result.total === 0
        ? 0
        : Math.ceil(result.total / parsedQuery.data.pageSize);

    return Response.json({
      data: result.items,
      pagination: {
        page: parsedQuery.data.page,
        pageSize: parsedQuery.data.pageSize,
        totalItems: result.total,
        totalPages,
      },
      lastImport: result.latestRun,
      lastSuccessfulImportAt: result.lastSuccessfulImportAt,
    });
  } catch {
    return Response.json(
      { error: "Failed to load menu data" },
      { status: 500 },
    );
  }
}
