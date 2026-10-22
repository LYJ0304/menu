import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { getAuthOptions } from "@/lib/auth";

export const runtime = "nodejs";

type AuthContext = { params: Promise<{ nextauth: string[] }> };

async function handler(request: NextRequest, context: AuthContext) {
  if (
    !process.env.KAKAO_CLIENT_ID ||
    !process.env.KAKAO_CLIENT_SECRET ||
    !process.env.NEXTAUTH_SECRET
  ) {
    return Response.json({ error: "로그인 설정이 필요합니다." }, { status: 503 });
  }

  const authHandler = NextAuth(getAuthOptions());
  return authHandler(request, { params: await context.params });
}

export { handler as GET, handler as POST };
