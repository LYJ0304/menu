import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getAuthOptions } from "@/lib/auth";
import { GET } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest } from "next/server";

afterEach(() => vi.unstubAllEnvs());

describe("authentication configuration", () => {
  it.each(["KAKAO_CLIENT_ID", "KAKAO_CLIENT_SECRET", "NEXTAUTH_SECRET"])(
    "rejects missing %s without calling OAuth",
    async (missing) => {
      vi.stubEnv("KAKAO_CLIENT_ID", "test-client");
      vi.stubEnv("KAKAO_CLIENT_SECRET", "test-client-secret");
      vi.stubEnv("NEXTAUTH_SECRET", "test-session-secret");
      vi.stubEnv(missing, "");

      expect(() => getAuthOptions()).toThrow("not configured");
      const response = await GET(
        new NextRequest("http://localhost:3000/api/auth/providers"),
        { params: Promise.resolve({ nextauth: ["providers"] }) },
      );
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: "로그인 설정이 필요합니다." });
    },
  );
});
