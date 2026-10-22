import { afterEach, expect, it, vi } from "vitest";
import { getMndMenuSourceConfig } from "@/features/meals/csv/sources/mnd-menu";
import { MND_MENU_SOURCE } from "@/features/meals/types";

afterEach(() => vi.unstubAllEnvs());

it("requests the 9030 unit dataset", () => {
  vi.stubEnv(
    "CSV_DOWNLOAD_URL",
    "https://opendata.mnd.go.kr/openinf/opencom/down2csv.jsp",
  );
  const config = getMndMenuSourceConfig();
  const body = config.body as URLSearchParams;

  expect(MND_MENU_SOURCE).toBe("mnd:OA-9561");
  expect(config.method).toBe("POST");
  expect(body.get("vinfId")).toBe("OA-9561");
  expect(body.get("dsId")).toBe("TB_MNDT_DATEBYMLSVC_9030");
  expect(body.get("infNm")).toContain("9030");
  expect(new Headers(config.headers).get("referer")).toContain("OA-9561");
});
