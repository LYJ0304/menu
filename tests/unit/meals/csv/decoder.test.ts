import { describe, expect, it } from "vitest";
import { decodeCsv } from "@/features/meals/csv/decoder";

describe("decodeCsv", () => {
  it("decodes UTF-8 and strips its BOM", () => {
    expect(decodeCsv(new TextEncoder().encode("\uFEFF날짜,조식"))).toBe(
      "날짜,조식",
    );
  });

  it("falls back to CP949/EUC-KR for Korean text", () => {
    expect(decodeCsv(Uint8Array.from([0xb3, 0xaf, 0xc2, 0xa5]))).toBe("날짜");
  });

  it("rejects bytes invalid in both supported encodings", () => {
    expect(() => decodeCsv(Uint8Array.from([0xff]))).toThrow(
      expect.objectContaining({ code: "INVALID_ENCODING" }),
    );
  });
});
