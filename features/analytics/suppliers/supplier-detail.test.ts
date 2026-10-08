import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';

import { commitmentsHttp } from '../commitments/api';
import { fetchSupplierDetail } from './api';
import { fillMissingMonths, isValidSupplierRoute } from './detail';
import { parseSupplierDetailFilters, serializeSupplierDetailFilters } from './query';
import type { SupplierDetailFilters, SupplierMonthlyEvolution } from './types';

const mock = new MockAdapter(commitmentsHttp);
afterEach(() => mock.reset());

const filters: SupplierDetailFilters = {
  start_date: '2025-01-01',
  end_date: '2025-04-30',
  uf: 'CE',
  municipality_tce_code: '010',
  company_sizes: ['ME', 'EPP'],
  supplier_origins: ['EM_OUTRO_MUNICIPIO'],
  expense_element_codes: ['30', '39'],
};

describe('detalhe de fornecedor', () => {
  it.each([
    ['CNPJ', '14313436000145', true],
    ['CPF', '12345678901', true],
    ['cnpj', '14313436000145', false],
    ['CNPJ', '14.313.436/0001-45', false],
    ['CPF', '1234567890', false],
    ['CNPJ', '12345678901', false],
  ])('valida a rota %s/%s', (type, document, expected) => {
    expect(isValidSupplierRoute(type, document)).toBe(expected);
  });

  it('não cria filtros sem as duas datas e ignora parâmetros exclusivos da lista', () => {
    expect(parseSupplierDetailFilters(new URLSearchParams('start_date=2025-01-01'))).toBeNull();
    const parsed = parseSupplierDetailFilters(new URLSearchParams(
      'start_date=2025-01-01&end_date=2025-12-31&page=9&page_size=100&sort_by=supplier&sort_order=asc&search=teste&company_sizes=ME',
    ));
    expect(parsed).toMatchObject({ start_date: '2025-01-01', end_date: '2025-12-31', company_sizes: ['ME'] });
    const serialized = serializeSupplierDetailFilters(parsed!);
    for (const key of ['page', 'page_size', 'sort_by', 'sort_order', 'search']) {
      expect(serialized.has(key)).toBe(false);
    }
  });

  it('envia arrays com chaves repetidas e nunca envia paginação ou ordenação', async () => {
    mock.onGet('/analytics/tce/fornecedores/CNPJ/14313436000145').reply((config) => {
      const params = config.params as URLSearchParams;
      expect(params.getAll('company_sizes')).toEqual(['ME', 'EPP']);
      expect(params.getAll('expense_element_codes')).toEqual(['30', '39']);
      expect(params.has('page')).toBe(false);
      expect(params.has('sort_by')).toBe(false);
      expect(params.has('search')).toBe(false);
      return [200, { fornecedor: { nome: 'Fornecedor' } }];
    });
    await fetchSupplierDetail('CNPJ', '14313436000145', filters);
  });

  it('preenche meses ausentes apenas na cópia de exibição', () => {
    const source: SupplierMonthlyEvolution[] = [{
      competencia: '2025-02',
      valor_empenhado_centavos: 1200,
      valor_anulado_centavos: 200,
      valor_considerado_centavos: 1000,
      quantidade_empenhos: 1,
    }];
    const snapshot = structuredClone(source);
    const display = fillMissingMonths('2025-01-01', '2025-04-30', source);
    expect(display.map((item) => [item.competencia, item.semMovimento])).toEqual([
      ['2025-01', true], ['2025-02', false], ['2025-03', true], ['2025-04', true],
    ]);
    expect(display[0].valor_considerado_centavos).toBe(0);
    expect(source).toEqual(snapshot);
  });

  it.each([
    [404, 'SUPPLIER_NOT_FOUND'],
    [422, 'INVALID_SUPPLIER_DOCUMENT'],
    [401, undefined],
    [403, undefined],
    [503, 'PIPELINE_UNAVAILABLE'],
  ])('normaliza HTTP %i', async (status, code) => {
    mock.onGet('/analytics/tce/fornecedores/CNPJ/14313436000145').reply(status, {
      error: { code, message: 'Falha', request_id: 'req-detail' },
    });
    await expect(fetchSupplierDetail('CNPJ', '14313436000145', filters)).rejects.toMatchObject({
      status,
      code,
      requestId: 'req-detail',
    });
  });
});
