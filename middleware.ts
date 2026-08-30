import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    
    // Decode base64 payload
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const decoded = JSON.parse(decodedJson);

    if (!decoded.exp) return false;

    // Check if current time exceeds token expiration (with 10-second margin)
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime + 10;
  } catch {
    return true; // If parsing fails, treat token as invalid/expired
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('EzxqowpoqiaQa')?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    // If token does not exist or is expired, clear cookie and redirect
    if (!token || isTokenExpired(token)) {
      const loginUrl = new URL('/?error=session_expired', request.url);
      const response = NextResponse.redirect(loginUrl);
      
      // Remove stale cookie
      response.cookies.delete('EzxqowpoqiaQa');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};