import { afterEach, describe, expect, it, vi } from "vitest";

import { getAuthOptions } from "@/lib/auth/options";
import { GET } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest } from "next/server";

afterEach(() => vi.unstubAllEnvs());

describe("authentication configuration", () => {
  it("uses Kakao with JWT sessions when configuration is present", () => {
    vi.stubEnv("KAKAO_CLIENT_ID", "test-client");
    vi.stubEnv("KAKAO_CLIENT_SECRET", "test-client-secret");
    vi.stubEnv("NEXTAUTH_SECRET", "test-session-secret");
    const options = getAuthOptions();
    expect(options?.providers[0].id).toBe("kakao");
    expect(options?.session?.strategy).toBe("jwt");
  });

  it.each(["KAKAO_CLIENT_ID", "KAKAO_CLIENT_SECRET", "NEXTAUTH_SECRET"])(
    "rejects missing %s without calling OAuth",
    async (missing) => {
      vi.stubEnv("KAKAO_CLIENT_ID", "test-client");
      vi.stubEnv("KAKAO_CLIENT_SECRET", "test-client-secret");
      vi.stubEnv("NEXTAUTH_SECRET", "test-session-secret");
      vi.stubEnv(missing, "");

      expect(getAuthOptions()).toBeNull();
      const response = await GET(
        new NextRequest("https://example.test/api/auth/providers"),
        { params: Promise.resolve({ nextauth: ["providers"] }) },
      );
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({
        error: "로그인 설정이 필요합니다.",
      });
    },
  );
});
