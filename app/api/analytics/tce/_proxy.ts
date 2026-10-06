import 'server-only';

import axios from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { createSingleFlight } from '@/features/analytics/commitments/single-flight';
import { createPublicDataCache, publicDataCacheKey } from '@/lib/cache/public-data-cache';

const API_BASE_URL = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';
const REQUEST_ID_HEADER = 'x-request-id';
type Tokens = { accessToken: string; refreshToken: string };
type PublicAnalyticsResponse = {
  data: unknown;
  requestId?: string;
  status: number;
};

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function isExpiredJwt(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      exp?: number;
    };
    return typeof decoded.exp === 'number' && decoded.exp * 1000 <= Date.now();
  } catch {
    // Opaque tokens are validated by the backend on a cache miss.
    return false;
  }
}

const publicAnalyticsCache = createPublicDataCache<PublicAnalyticsResponse>({
  ttlMs: positiveInteger(process.env.ANALYTICS_CACHE_TTL_SECONDS, 300) * 1000,
  maxEntries: positiveInteger(process.env.ANALYTICS_CACHE_MAX_ENTRIES, 250),
});
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

async function upstreamPost(path: string, body: unknown, accessToken?: string) {
  return axios.post(`${API_BASE_URL}${path}`, body, {
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}) },
    timeout: 35_000,
  });
}

function publicResponse(
  upstream: Awaited<ReturnType<typeof upstreamGet>>,
): PublicAnalyticsResponse {
  const requestId = upstream.headers[REQUEST_ID_HEADER];
  return {
    data: upstream.data,
    status: upstream.status,
    ...(requestId ? { requestId: String(requestId) } : {}),
  };
}

function cachedUpstreamGet(path: string, accessToken: string) {
  return publicAnalyticsCache.read(publicDataCacheKey('GET', path), async () =>
    publicResponse(await upstreamGet(path, accessToken)));
}

function cachedUpstreamPost(path: string, body: unknown, accessToken: string) {
  return publicAnalyticsCache.read(publicDataCacheKey('POST', path, body), async () =>
    publicResponse(await upstreamPost(path, body, accessToken)));
}

function requestIdFrom(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const body = error.response?.data as { error?: { request_id?: string } } | undefined;
  return error.response?.headers?.[REQUEST_ID_HEADER] ?? body?.error?.request_id;
}

function errorResponse(error: unknown) {
  if (!axios.isAxiosError(error)) {
    const response = NextResponse.json(
      { error: { message: 'Falha inesperada ao consultar dados analíticos.' } },
      { status: 500 },
    );
    response.headers.set('cache-control', 'private, no-store');
    return response;
  }
  const status = error.response?.status ?? 503;
  const requestId = requestIdFrom(error);
  const response = NextResponse.json(
    error.response?.data ?? { error: { message: 'Serviço analítico temporariamente indisponível.' } },
    { status },
  );
  if (requestId) response.headers.set(REQUEST_ID_HEADER, requestId);
  response.headers.set('cache-control', 'private, no-store');
  return response;
}

function successResponse(upstream: PublicAnalyticsResponse, cacheHit: boolean) {
  const response = NextResponse.json(upstream.data, { status: upstream.status });
  if (upstream.requestId) response.headers.set(REQUEST_ID_HEADER, upstream.requestId);
  response.headers.set('x-analytics-cache', cacheHit ? 'HIT' : 'MISS');
  response.headers.set('cache-control', 'private, no-store');
  return response;
}

export async function proxyAnalyticsGet(request: NextRequest, path: string, forwardQuery: boolean) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const query = forwardQuery ? request.nextUrl.searchParams.toString() : '';
  const upstreamPath = `${path}${query ? `?${query}` : ''}`;
  try {
    if (!accessToken || isExpiredJwt(accessToken)) {
      return successResponse(publicResponse(await upstreamGet(upstreamPath, accessToken)), false);
    }
    const cached = await cachedUpstreamGet(upstreamPath, accessToken);
    return successResponse(cached.value, cached.hit);
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (status !== 401 || !refreshToken) return errorResponse(error);
    try {
      const refreshed = await refreshSession(refreshToken);
      const cached = await cachedUpstreamGet(upstreamPath, refreshed.accessToken);
      const response = successResponse(cached.value, cached.hit);
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

export async function proxyAnalyticsPost(path: string, body: unknown) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  try {
    if (!accessToken || isExpiredJwt(accessToken)) {
      return successResponse(publicResponse(await upstreamPost(path, body, accessToken)), false);
    }
    const cached = await cachedUpstreamPost(path, body, accessToken);
    return successResponse(cached.value, cached.hit);
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (status !== 401 || !refreshToken) return errorResponse(error);
    try {
      const refreshed = await refreshSession(refreshToken);
      const cached = await cachedUpstreamPost(path, body, refreshed.accessToken);
      const response = successResponse(cached.value, cached.hit);
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

