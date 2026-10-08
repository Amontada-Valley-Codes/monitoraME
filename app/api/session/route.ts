import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

function accountStatus(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { status?: unknown };
    return typeof claims.status === 'string' ? claims.status : null;
  } catch {
    return null;
  }
}

export async function GET() {
  const store = await cookies();
  const accessToken = store.get('access_token')?.value;
  const refreshToken = store.get('refresh_token')?.value;
  return NextResponse.json({
    authenticated: Boolean(accessToken || refreshToken),
    accountStatus: accountStatus(accessToken),
  }, { headers: { 'cache-control': 'private, no-store' } });
}

export async function DELETE() {
  const store = await cookies();
  store.delete('access_token');
  store.delete('refresh_token');
  return new NextResponse(null, { status: 204, headers: { 'cache-control': 'private, no-store' } });
}

