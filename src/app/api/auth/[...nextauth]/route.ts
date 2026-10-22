import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { getAuthOptions } from "@/lib/auth/options";

export const runtime = "nodejs";

type AuthContext = { params: Promise<{ nextauth: string[] }> };

async function handler(request: NextRequest, context: AuthContext) {
  const options = getAuthOptions();
  if (!options) {
    return Response.json(
      { error: "로그인 설정이 필요합니다." },
      { status: 503 },
    );
  }

  const authHandler = NextAuth(options);
  return authHandler(request, { params: await context.params });
}

export { handler as GET, handler as POST };
