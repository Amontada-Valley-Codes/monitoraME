import axios, { AxiosError } from 'axios';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

type Tokens = { accessToken: string; refreshToken: string };

async function requestCommitments(request: NextRequest, accessToken?: string) {
  const query = request.nextUrl.searchParams.toString();
  return axios.get(`${API_BASE_URL}/analytics/tce/empenhos${query ? `?${query}` : ''}`, {
    headers: {
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    timeout: 120_000,
  });
}

function errorResponse(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return NextResponse.json({ message: 'Falha inesperada ao consultar empenhos.' }, { status: 500 });
  }
  const status = error.response?.status ?? 503;
  return NextResponse.json(
    error.response?.data ?? { message: 'Serviço de empenhos temporariamente indisponível.' },
    { status },
  );
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  try {
    const response = await requestCommitments(request, accessToken);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    const refreshToken = cookieStore.get('refresh_token')?.value;
    if (status !== 401 || !refreshToken) return errorResponse(error);

    try {
      const refreshed = await axios.post<Tokens>(`${API_BASE_URL}/sessions/refresh`, {
        refreshToken,
      });
      const retried = await requestCommitments(request, refreshed.data.accessToken);
      const response = NextResponse.json(retried.data, { status: retried.status });
      response.cookies.set('access_token', refreshed.data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 15,
      });
      response.cookies.set('refresh_token', refreshed.data.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    } catch (refreshError) {
      const response = errorResponse(refreshError as AxiosError);
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }
}
