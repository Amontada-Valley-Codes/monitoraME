import axios from 'axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createSingleFlight } from '@/features/analytics/commitments/single-flight';

const API_BASE_URL = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';
type Tokens = { accessToken: string; refreshToken: string };
const runRefreshSingleFlight = createSingleFlight<string, Tokens>();

function hasUsableJwt(token: string | undefined) {
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: unknown };
    return typeof claims.exp === 'number' && claims.exp * 1000 > Date.now() + 5_000;
  } catch { return false; }
}

export async function POST() {
  const store = await cookies();
  if (hasUsableJwt(store.get('access_token')?.value)) return NextResponse.json({ refreshed: false }, { headers: { 'cache-control': 'private, no-store' } });
  const refreshToken = store.get('refresh_token')?.value;
  if (!refreshToken) return NextResponse.json({ message: 'Sessão ausente.' }, { status: 401 });
  try {
    const tokens = await runRefreshSingleFlight(refreshToken, () => axios.post<Tokens>(`${API_BASE_URL}/sessions/refresh`, { refreshToken }, { timeout: 35_000 }).then((response) => response.data));
    const response = NextResponse.json({ refreshed: true }, { headers: { 'cache-control': 'private, no-store' } });
    response.cookies.set('access_token', tokens.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 15 });
    response.cookies.set('refresh_token', tokens.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch {
    const response = NextResponse.json({ message: 'Sessão expirada.' }, { status: 401, headers: { 'cache-control': 'private, no-store' } });
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
  }
}

