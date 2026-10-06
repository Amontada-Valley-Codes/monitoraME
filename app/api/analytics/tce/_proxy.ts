import 'server-only';

import axios from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createSingleFlight } from '@/features/analytics/commitments/single-flight';

const API_BASE_URL = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';
const REQUEST_ID_HEADER = 'x-request-id';
type Tokens = { accessToken: string; refreshToken: string };
const runRefreshSingleFlight = createSingleFlight<string, Tokens>();

function refreshSession(refreshToken: string): Promise<Tokens> {
  return runRefreshSingleFlight(refreshToken, () => axios
    .post<Tokens>(`${API_BASE_URL}/sessions/refresh`, { refreshToken }, { timeout: 35_000 })
    .then((response) => response.data));
}

async function upstreamGet(path: string, accessToken?: string) {
  return axios.get(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    timeout: 35_000,
  });
}

function requestIdFrom(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const body = error.response?.data as { error?: { request_id?: string } } | undefined;
  return error.response?.headers?.[REQUEST_ID_HEADER] ?? body?.error?.request_id;
}

function errorResponse(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return NextResponse.json({ error: { message: 'Falha inesperada ao consultar dados analíticos.' } }, { status: 500 });
  }
  const status = error.response?.status ?? 503;
  const requestId = requestIdFrom(error);
  const response = NextResponse.json(
    error.response?.data ?? { error: { message: 'Serviço analítico temporariamente indisponível.' } },
    { status },
  );
  if (requestId) response.headers.set(REQUEST_ID_HEADER, requestId);
  return response;
}

function successResponse(upstream: Awaited<ReturnType<typeof upstreamGet>>) {
  const response = NextResponse.json(upstream.data, { status: upstream.status });
  const requestId = upstream.headers[REQUEST_ID_HEADER];
  if (requestId) response.headers.set(REQUEST_ID_HEADER, String(requestId));
  return response;
}

export async function proxyAnalyticsGet(request: NextRequest, path: string, forwardQuery: boolean) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const query = forwardQuery ? request.nextUrl.searchParams.toString() : '';
  const upstreamPath = `${path}${query ? `?${query}` : ''}`;
  try {
    return successResponse(await upstreamGet(upstreamPath, accessToken));
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (status !== 401 || !refreshToken) return errorResponse(error);
    try {
      const refreshed = await refreshSession(refreshToken);
      const response = successResponse(await upstreamGet(upstreamPath, refreshed.accessToken));
      response.cookies.set('access_token', refreshed.accessToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 15,
      });
      response.cookies.set('refresh_token', refreshed.refreshToken, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    } catch (refreshError) {
      const response = errorResponse(refreshError);
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }
}

