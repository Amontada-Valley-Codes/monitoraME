'use client';

import axios from 'axios';

import { serializeCommitmentFilters } from './query';
import type { CommitmentListFilters, CommitmentListResponse } from './types';

export const commitmentsHttp = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
});

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

