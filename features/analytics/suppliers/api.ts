'use client';

import axios from 'axios';
import { AnalyticsApiError, commitmentsHttp } from '../commitments/api';
import { serializeSupplierFilters } from './query';
import type { SupplierListFilters, SupplierListResponse } from './types';

export async function fetchSuppliers(
  filters: SupplierListFilters,
  signal?: AbortSignal,
): Promise<SupplierListResponse> {
  try {
    const response = await commitmentsHttp.get<SupplierListResponse>(
      '/analytics/tce/fornecedores',
      { params: serializeSupplierFilters(filters), signal },
    );
    return response.data;
  } catch (error) {
    if (error instanceof AnalyticsApiError) throw error;
    if (!axios.isAxiosError(error)) {
      throw new AnalyticsApiError(500, 'Não foi possível carregar os fornecedores.');
    }
    const body = error.response?.data as {
      error?: { code?: string; message?: string; request_id?: string };
      message?: string;
    } | undefined;
    throw new AnalyticsApiError(
      error.response?.status ?? 0,
      body?.error?.message ?? body?.message ?? (error.response ? 'Erro inesperado.' : 'Sem conexão.'),
      body?.error?.code,
      error.response?.headers?.['x-request-id'] ?? body?.error?.request_id,
    );
  }
}
