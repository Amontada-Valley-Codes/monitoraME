import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';

import { money } from '../../../shared/lib/format';
import { commitmentsHttp, fetchCommitments } from './api';
import { getCommitmentErrorContent, getCommitmentViewState } from './error-state';
import { buildCommitmentDetailHref, safeCommitmentListPath } from './navigation';
import { DEFAULT_COMMITMENT_FILTERS, nextCommitmentSort, patchCommitmentFilters } from './query';

const mock = new MockAdapter(commitmentsHttp);
afterEach(() => mock.reset());

describe('consulta de empenhos', () => {
  it('serializa arrays como chaves repetidas na requisição Axios real', async () => {
    mock.onGet('/analytics/tce/empenhos').reply((config) => {
      const params = config.params as URLSearchParams;
      expect(params.getAll('company_sizes')).toEqual(['ME', 'EPP']);
      expect(params.getAll('supplier_origins')).toEqual(['FORA_DO_CEARA', 'EM_OUTRO_MUNICIPIO']);
      expect(params.toString()).toContain('company_sizes=ME&company_sizes=EPP');
      return [200, { items: [] }];
    });
    await fetchCommitments({
      ...DEFAULT_COMMITMENT_FILTERS,
      company_sizes: ['ME', 'EPP'],
      supplier_origins: ['FORA_DO_CEARA', 'EM_OUTRO_MUNICIPIO'],
    });
  });

  it('reseta a página ao mudar filtro e alterna a ordenação', () => {
    const current = { ...DEFAULT_COMMITMENT_FILTERS, page: 8 };
    expect(patchCommitmentFilters(current, { search: '10100004' }).page).toBe(1);
    expect(nextCommitmentSort('net_value', 'desc', 'net_value')).toEqual({ sort_by: 'net_value', sort_order: 'asc' });
    expect(nextCommitmentSort('net_value', 'asc', 'date')).toEqual({ sort_by: 'date', sort_order: 'desc' });
  });

  it('codifica a chave e restaura integralmente a URL de origem', () => {
    const from = '/analitico/empenhos?page=3&sort_by=date&sort_order=asc';
    const href = buildCommitmentDetailHref('010|202500|16|01|2025-10-10|10100004', from);
    expect(href).toContain('010%7C202500%7C16%7C01%7C2025-10-10%7C10100004');
    expect(safeCommitmentListPath(new URL(href, 'https://monitorame.local').searchParams.get('from')!)).toBe(from);
  });

  it.each([401, 403, 422, 503])('possui estado específico para HTTP %i', (status) => {
    expect(getCommitmentErrorContent(status, 'mensagem').title).toBeTruthy();
  });

  it('distingue loading, vazio, erro e dados prontos', () => {
    expect(getCommitmentViewState(true, false, 0)).toBe('loading');
    expect(getCommitmentViewState(false, false, 0)).toBe('empty');
    expect(getCommitmentViewState(false, true, 0)).toBe('error');
    expect(getCommitmentViewState(false, false, 2)).toBe('ready');
  });

  it('formata valores inteiros em centavos', () => {
    expect(money(136838000)).toBe('R$ 1.368.380,00');
  });
});
