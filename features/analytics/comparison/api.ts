'use client';

import { AnalyticsApiError, commitmentsHttp } from '../commitments/api';
import type { ComparisonRequest, ComparisonResponse } from './types';
import { comparisonRequestSchema } from './schema';

export async function fetchComparison(body: ComparisonRequest, signal?: AbortSignal): Promise<ComparisonResponse> {
  try {
    const parsed = comparisonRequestSchema.safeParse(body);
    if (!parsed.success) throw new AnalyticsApiError(400, 'Revise os campos da comparação.');
    const response = await commitmentsHttp.post<ComparisonResponse>('/analytics/tce/comparisons', parsed.data, { signal });
    return response.data;
  } catch (error) {
    if (error instanceof AnalyticsApiError) throw error;
    const candidate = error as { response?: { status?: number; data?: { error?: { code?: string; message?: string; request_id?: string } }; headers?: Record<string, string> }; message?: string };
    const payload = candidate.response?.data?.error;
    throw new AnalyticsApiError(
      candidate.response?.status ?? 0,
      payload?.message ?? candidate.message ?? 'Sem conexão.',
      payload?.code,
      candidate.response?.headers?.['x-request-id'] ?? payload?.request_id,
    );
  }
}
