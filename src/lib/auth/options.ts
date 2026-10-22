import "server-only";

import type { NextAuthOptions } from "next-auth";
import KakaoProvider from "next-auth/providers/kakao";

export function getAuthOptions(): NextAuthOptions | null {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;
  const secret = process.env.NEXTAUTH_SECRET;

  if (!clientId || !clientSecret || !secret) {
    return null;
  }

  return {
    secret,
    providers: [KakaoProvider({ clientId, clientSecret })],
    session: { strategy: "jwt" },
  };
}
