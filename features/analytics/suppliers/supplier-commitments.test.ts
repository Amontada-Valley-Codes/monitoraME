import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';

import { commitmentsHttp } from '../commitments/api';
import { buildCommitmentDetailHref, safeCommitmentListPath } from '../commitments/navigation';
import { fetchSupplierCommitments } from './commitments-api';
import { parseSupplierCommitmentFilters } from './commitments-query';
import type { SupplierCommitmentFilters } from './commitments-types';

const mock = new MockAdapter(commitmentsHttp);
afterEach(() => mock.reset());

const filters: SupplierCommitmentFilters = {
  start_date: '2025-01-01', end_date: '2025-12-31', uf: 'CE',
  company_sizes: ['ME', 'EPP'], supplier_origins: [], expense_element_codes: ['30'],
  page: 1, page_size: 20, sort_by: 'net_value', sort_order: 'desc',
};

describe('empenhos do fornecedor', () => {
  it('aceita apenas o enum de ordenação de empenhos', () => {
    const valid = parseSupplierCommitmentFilters(new URLSearchParams('start_date=2025-01-01&end_date=2025-12-31&sort_by=date'));
    const invalid = parseSupplierCommitmentFilters(new URLSearchParams('start_date=2025-01-01&end_date=2025-12-31&sort_by=commitments_count'));
    expect(valid?.sort_by).toBe('date');
    expect(invalid?.sort_by).toBe('net_value');
  });

  it('serializa filtros, paginação e arrays para o endpoint específico', async () => {
    mock.onGet('/analytics/tce/fornecedores/CNPJ/14313436000145/empenhos').reply((config) => {
      const params = config.params as URLSearchParams;
      expect(params.getAll('company_sizes')).toEqual(['ME', 'EPP']);
      expect(params.get('page')).toBe('1');
      expect(params.get('page_size')).toBe('20');
      expect(params.get('sort_by')).toBe('net_value');
      return [200, { items: [] }];
    });
    await fetchSupplierCommitments('CNPJ', '14313436000145', filters);
  });

  it('paginar consulta apenas a lista independente, não o detalhe do fornecedor', async () => {
    mock.onGet('/analytics/tce/fornecedores/CNPJ/14313436000145/empenhos').reply(200, { items: [] });
    await fetchSupplierCommitments('CNPJ', '14313436000145', filters);
    await fetchSupplierCommitments('CNPJ', '14313436000145', { ...filters, page: 2 });
    expect(mock.history.get).toHaveLength(2);
    expect(mock.history.get.every((request) => request.url?.endsWith('/empenhos'))).toBe(true);
  });

  it('codifica a chave e preserva esta lista como destino do botão voltar', () => {
    const from = '/analytics/fornecedores/CNPJ/14313436000145/empenhos?page=2&sort_by=date';
    const href = buildCommitmentDetailHref('010|202500|16|01|2025-10-10|10100004', from);
    expect(href).toContain('010%7C202500%7C16%7C01%7C2025-10-10%7C10100004');
    expect(safeCommitmentListPath(new URL(href, 'https://monitorame.local').searchParams.get('from')!)).toBe(from);
  });

  it.each([
    [404, 'SUPPLIER_NOT_FOUND'], [422, 'INVALID_DATE_RANGE'], [401, undefined],
    [403, undefined], [503, 'PIPELINE_UNAVAILABLE'],
  ])('normaliza HTTP %i', async (status, code) => {
    mock.onGet('/analytics/tce/fornecedores/CNPJ/14313436000145/empenhos').reply(status, {
      error: { code, message: 'Falha', request_id: 'req-list' },
    });
    await expect(fetchSupplierCommitments('CNPJ', '14313436000145', filters)).rejects.toMatchObject({
      status, code, requestId: 'req-list',
    });
  });
});
