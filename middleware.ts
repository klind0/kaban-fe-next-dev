import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Must match enum/queryKeys.ts → QUERY_KEY.ACCESS_TOKEN */
const ACCESS_TOKEN_COOKIE = "EzxqowpoqiaQa";
/** Must match enum/queryKeys.ts → QUERY_KEY.REFRESH_TOKEN */
const REFRESH_TOKEN_COOKIE = "PPqaksjqoiu";

function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return true;

    const decodedJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
    const decoded = JSON.parse(decodedJson);

    if (!decoded.exp) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime + 10;
  } catch {
    return true;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (!token || isTokenExpired(token)) {
      const loginUrl = new URL("/?error=session_expired", request.url);
      const response = NextResponse.redirect(loginUrl);

      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};