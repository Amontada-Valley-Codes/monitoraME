'use client';

import axios from 'axios';
import { AnalyticsApiError, commitmentsHttp } from '../commitments/api';
import { serializeSupplierCommitmentFilters } from './commitments-query';
import type { SupplierCommitmentFilters, SupplierCommitmentsResponse } from './commitments-types';

export async function fetchSupplierCommitments(
  type: 'CNPJ' | 'CPF',
  document: string,
  filters: SupplierCommitmentFilters,
  signal?: AbortSignal,
): Promise<SupplierCommitmentsResponse> {
  try {
    const path = `/analytics/tce/fornecedores/${encodeURIComponent(type)}/${encodeURIComponent(document)}/empenhos`;
    const response = await commitmentsHttp.get<SupplierCommitmentsResponse>(path, {
      params: serializeSupplierCommitmentFilters(filters),
      signal,
    });
    return response.data;
  } catch (error) {
    if (error instanceof AnalyticsApiError) throw error;
    if (!axios.isAxiosError(error)) throw new AnalyticsApiError(500, 'Não foi possível carregar os empenhos.');
    const body = error.response?.data as { error?: { code?: string; message?: string; request_id?: string }; message?: string } | undefined;
    throw new AnalyticsApiError(
      error.response?.status ?? 0,
      body?.error?.message ?? body?.message ?? (error.response ? 'Erro inesperado.' : 'Sem conexão.'),
      body?.error?.code,
      error.response?.headers?.['x-request-id'] ?? body?.error?.request_id,
    );
  }
}
