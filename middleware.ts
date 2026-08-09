import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  const supabaseAccessToken = request.cookies.get('sb-access-token')?.value;
  const supabaseRefreshToken = request.cookies.get('sb-refresh-token')?.value;
  const hasSession = !!(supabaseAccessToken && supabaseRefreshToken);

  const protectedPaths = ['/dashboard', '/admin', '/provider'];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/provider/:path*'],
};
