import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';
type Tokens = { accessToken: string; refreshToken: string };

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json() as { token?: unknown };
    if (typeof token !== 'string' || !token.trim()) return NextResponse.json({ message: 'Link inválido.' }, { status: 400 });
    const upstream = await axios.post<Tokens>(`${API_BASE_URL}/sessions/onboarding`, { token }, { timeout: 35_000 });
    const response = NextResponse.json({ authenticated: true }, { headers: { 'cache-control': 'private, no-store' } });
    response.cookies.set('access_token', upstream.data.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 15 });
    response.cookies.set('refresh_token', upstream.data.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json({ message: error.response ? 'Este link não é mais válido.' : 'Não foi possível validar agora.' }, { status: error.response?.status ?? 503, headers: { 'cache-control': 'private, no-store' } });
    }
    return NextResponse.json({ message: 'Não foi possível validar agora.' }, { status: 500, headers: { 'cache-control': 'private, no-store' } });
  }
}

