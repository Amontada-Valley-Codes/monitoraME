'use client';

import axios from 'axios';

import { serializeCommitmentFilters } from './query';
import { buildCommitmentApiPath } from './navigation';
import type { CommitmentDetail, CommitmentListFilters, CommitmentListResponse } from './types';

export const commitmentsHttp = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
  timeout: 35_000,
  paramsSerializer: { indexes: null },
});

export class AnalyticsApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'AnalyticsApiError';
  }
}

function normalizeAnalyticsError(error: unknown): AnalyticsApiError {
  if (error instanceof AnalyticsApiError) return error;
  if (!axios.isAxiosError(error)) return new AnalyticsApiError(500, 'Erro inesperado.');
  const body = error.response?.data as {
    error?: { code?: string; message?: string; request_id?: string };
    message?: string;
  } | undefined;
  const requestId = error.response?.headers?.['x-request-id'] ?? body?.error?.request_id;
  return new AnalyticsApiError(
    error.response?.status ?? 0,
    body?.error?.message ?? body?.message ?? (error.response ? 'Erro inesperado.' : 'Sem conexão.'),
    body?.error?.code,
    requestId,
  );
}

export async function fetchCommitments(
  filters: CommitmentListFilters,
  signal?: AbortSignal,
): Promise<CommitmentListResponse> {
  const response = await commitmentsHttp.get<CommitmentListResponse>(
    '/analytics/tce/empenhos',
    { params: serializeCommitmentFilters(filters), signal },
  );
  return response.data;
}

export async function fetchCommitmentDetail(
  routeKey: string,
  signal?: AbortSignal,
): Promise<CommitmentDetail> {
  try {
    const response = await commitmentsHttp.get<CommitmentDetail>(buildCommitmentApiPath(routeKey), { signal });
    return response.data;
  } catch (error) {
    throw normalizeAnalyticsError(error);
  }
}

