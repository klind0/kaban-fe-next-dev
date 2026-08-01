import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Grab your authentication token cookie
  const token = request.cookies.get('EzxqowpoqiaQa')?.value;
  const { pathname } = request.nextUrl;

  // If the user tries to access any /dashboard route without a token cookie
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/?error=session_expired', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which paths this middleware runs on
export const config = {
  matcher: ['/dashboard/:path*'],
};