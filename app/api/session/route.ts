import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function accountClaims(token: string | undefined): { status: string | null; role: string | null } {
  if (!token) return { status: null, role: null };
  try {
    const payload = token.split('.')[1];
    if (!payload) return { status: null, role: null };
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { status?: unknown; role?: unknown };
    return {
      status: typeof claims.status === 'string' ? claims.status : null,
      role: typeof claims.role === 'string' ? claims.role : null,
    };
  } catch {
    return { status: null, role: null };
  }
}

export async function GET() {
  const store = await cookies();
  const accessToken = store.get('access_token')?.value;
  const refreshToken = store.get('refresh_token')?.value;
  const claims = accountClaims(accessToken);
  return NextResponse.json({
    authenticated: Boolean(accessToken || refreshToken),
    accountStatus: claims.status,
    accountRole: claims.role,
  }, { headers: { 'cache-control': 'private, no-store' } });
}

export async function DELETE() {
  const store = await cookies();
  store.delete('access_token');
  store.delete('refresh_token');
  return new NextResponse(null, { status: 204, headers: { 'cache-control': 'private, no-store' } });
}

