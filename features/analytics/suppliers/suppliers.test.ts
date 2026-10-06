import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';

import { commitmentsHttp } from '../commitments/api';
import { getCommitmentViewState } from '../commitments/error-state';
import { fetchSuppliers } from './api';
import {
  buildSupplierDetailHref,
  canOpenSupplierDetail,
  formatSupplierDocument,
} from './navigation';
import {
  DEFAULT_SUPPLIER_FILTERS,
  nextSupplierSort,
  patchSupplierFilters,
} from './query';

const mock = new MockAdapter(commitmentsHttp);
afterEach(() => mock.reset());

describe('lista de fornecedores', () => {
  it('serializa arrays como chaves repetidas na requisição Axios real', async () => {
    mock.onGet('/analytics/tce/fornecedores').reply((config) => {
      const params = config.params as URLSearchParams;
      expect(params.getAll('company_sizes')).toEqual(['ME', 'EPP']);
      expect(params.getAll('supplier_origins')).toEqual([
        'NO_MUNICIPIO_COMPRADOR',
        'FORA_DO_CEARA',
      ]);
      expect(params.getAll('expense_element_codes')).toEqual(['30', '39']);
      expect(params.toString()).toContain('company_sizes=ME&company_sizes=EPP');
      return [200, { items: [] }];
    });

    await fetchSuppliers({
      ...DEFAULT_SUPPLIER_FILTERS,
      company_sizes: ['ME', 'EPP'],
      supplier_origins: ['NO_MUNICIPIO_COMPRADOR', 'FORA_DO_CEARA'],
      expense_element_codes: ['30', '39'],
    });
  });

  it('reseta a página ao mudar filtros e usa o enum de ordenação da lista', () => {
    const current = { ...DEFAULT_SUPPLIER_FILTERS, page: 7 };
    expect(patchSupplierFilters(current, { search: 'Fornecedor' }).page).toBe(1);
    expect(nextSupplierSort('net_value', 'desc', 'commitments_count')).toEqual({
      sort_by: 'commitments_count',
      sort_order: 'desc',
    });
    expect(nextSupplierSort('commitments_count', 'desc', 'commitments_count')).toEqual({
      sort_by: 'commitments_count',
      sort_order: 'asc',
    });
  });

  it('mantém CPF parcial sem máscara e sem link', () => {
    const supplier = { tipo_documento: 'CPF' as const, documento: '3' };
    expect(formatSupplierDocument(supplier)).toBe('3');
    expect(canOpenSupplierDetail(supplier.documento)).toBe(false);
    expect(buildSupplierDetailHref(supplier, 'page=3&sort_by=net_value')).toBeNull();
  });

  it('mascara CNPJ somente na exibição e navega com os dígitos e filtros', () => {
    const supplier = {
      tipo_documento: 'CNPJ' as const,
      documento: '12.345.678/0001-90',
    };
    const href = buildSupplierDetailHref(
      supplier,
      'start_date=2025-01-01&page=3&sort_by=net_value&sort_order=desc',
    );

    expect(formatSupplierDocument(supplier)).toBe('12.345.678/0001-90');
    expect(formatSupplierDocument({
      tipo_documento: 'CNPJ',
      documento: '12345678000190',
    })).toBe('12.345.678/0001-90');
    expect(href).toBe(
      '/analytics/fornecedores/CNPJ/12345678000190?start_date=2025-01-01&page=3&sort_by=net_value&sort_order=desc',
    );
    expect(href).not.toContain('12.345');
  });

  it('distingue loading, vazio, erro e dados prontos', () => {
    expect(getCommitmentViewState(true, false, 0)).toBe('loading');
    expect(getCommitmentViewState(false, false, 0)).toBe('empty');
    expect(getCommitmentViewState(false, true, 0)).toBe('error');
    expect(getCommitmentViewState(false, false, 1)).toBe('ready');
  });

  it.each([401, 403, 422, 503])('normaliza HTTP %i', async (status) => {
    mock.onGet('/analytics/tce/fornecedores').reply(status, {
      error: { message: 'Falha', request_id: 'req-supplier' },
    });
    await expect(fetchSuppliers(DEFAULT_SUPPLIER_FILTERS)).rejects.toMatchObject({
      status,
      requestId: 'req-supplier',
    });
  });
});
