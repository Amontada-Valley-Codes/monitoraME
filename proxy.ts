import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/analytics/') || pathname === '/analitico' || (pathname.startsWith('/analitico/') && !pathname.startsWith('/analitico/municipios'))) return NextResponse.next();

  const accessToken = request.cookies.get('access_token')?.value;
  const hasSession = Boolean(accessToken || request.cookies.has('refresh_token'));
  const returnTo = `${pathname}${request.nextUrl.search}`;

  if (hasSession) {
    const allowsLead = pathname === '/analitico/municipios' || pathname.startsWith('/analitico/municipios/');
    if (!allowsLead && readStatus(accessToken) === 'ONBOARDING') {
      const destination = new URL('/onboarding/complete', request.url);
      destination.searchParams.set('returnTo', returnTo);
      return NextResponse.redirect(destination);
    }
    return NextResponse.next();
  }

  const destination = new URL('/', request.url);
  destination.searchParams.set('cta', 'lead');
  destination.searchParams.set('returnTo', returnTo);
  return NextResponse.redirect(destination);
}

function readStatus(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(base64)) as { status?: unknown };
    return typeof decoded.status === 'string' ? decoded.status : null;
  } catch {
    return null;
  }
}

export const config = { matcher: ['/analitico/:path*', '/analytics/:path*', '/request-access/company/:path*', '/home'] };
