import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';

import { money } from '../../../shared/lib/format';
import { commitmentsHttp, fetchCommitmentDetail, fetchCommitments } from './api';
import { cancellationModalityLabel, cancellationSummary, nullableLabel } from './detail-format';
import { getCommitmentErrorContent, getCommitmentViewState } from './error-state';
import { buildCommitmentApiPath, buildCommitmentDetailHref, safeCommitmentListPath, safeDecodeCommitmentKey, supplierHref } from './navigation';
import { commitmentExerciseFilters, DEFAULT_COMMITMENT_FILTERS, nextCommitmentSort, normalizeExpenseElementCode, parseCommitmentFilters, patchCommitmentFilters, serializeCommitmentFilters } from './query';
import { createSingleFlight } from './single-flight';

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

  it('converte o exercício em período fechado e normaliza URLs antigas', () => {
    expect(commitmentExerciseFilters('2024')).toEqual({
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    });
    expect(parseCommitmentFilters(new URLSearchParams(
      'start_date=2024-03-10&end_date=2025-07-20',
    ))).toMatchObject({
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    });
  });

  it('normaliza códigos completos de elemento de despesa para o enum da API', () => {
    expect(normalizeExpenseElementCode('339040')).toBe('40');
    expect(normalizeExpenseElementCode('40')).toBe('40');
    expect(normalizeExpenseElementCode('999999')).toBeNull();
    expect(parseCommitmentFilters(new URLSearchParams('expense_element_codes=339040&expense_element_codes=40')).expense_element_codes).toEqual(['40']);
    expect(serializeCommitmentFilters({ ...DEFAULT_COMMITMENT_FILTERS, expense_element_codes: ['339040'] }).getAll('expense_element_codes')).toEqual(['40']);
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

  it('normaliza e codifica a chave exatamente uma vez na chamada de detalhe', async () => {
    const encoded = '010%7C202500%7C16%7C01%7C2025-10-10%7C10100004';
    expect(safeDecodeCommitmentKey(encoded)).toBe('010|202500|16|01|2025-10-10|10100004');
    expect(safeDecodeCommitmentKey('010|202500')).toBe('010|202500');
    expect(buildCommitmentApiPath(encoded)).toContain(encoded);
    expect(buildCommitmentApiPath(encoded)).not.toContain('%257C');
    mock.onGet(`/analytics/tce/empenhos/${encoded}`).reply((config) => {
      expect(config.url).toBe(`/analytics/tce/empenhos/${encoded}`);
      expect(config.url).not.toContain('%257C');
      expect(config.params).toBeUndefined();
      return [200, { chave_empenho: '010|202500|16|01|2025-10-10|10100004' }];
    });
    await fetchCommitmentDetail(encoded);
  });

  it('usa travessão para campos nulos e trata anulações de formato desconhecido', () => {
    expect(nullableLabel(null)).toBe('—');
    expect(nullableLabel(undefined)).toBe('—');
    expect(cancellationSummary([]).label).toBe('Sem anulações');
    expect(cancellationSummary([{ qualquer: 'formato' }, 'texto', null]).count).toBe(3);
  });

  it('traduz a modalidade de anulação retornada pela API', () => {
    expect(cancellationModalityLabel('P')).toBe('Parcial');
    expect(cancellationModalityLabel('T')).toBe('Total');
    expect(cancellationModalityLabel('X')).toBe('X');
  });

  it('deriva CNPJ pelo documento e ignora tipo_documento numérico', () => {
    const supplier = { documento: '12.345.678/0001-90', cnpj: '12345678000190', cpf: null, tipo_documento: '1' };
    expect(supplierHref(supplier)).toBe('/analytics/fornecedores/CNPJ/12345678000190');
    expect(supplierHref(supplier, {
      from: '/analitico/empenhos?start_date=2024-01-01&end_date=2024-12-31',
      commitmentDate: '2025-10-10',
      exercise: 2025,
    })).toBe('/analytics/fornecedores/CNPJ/12345678000190?start_date=2024-01-01&end_date=2024-12-31');
    expect(supplierHref(supplier, {
      commitmentDate: '2025-10-10',
      exercise: 2025,
    })).toBe('/analytics/fornecedores/CNPJ/12345678000190?start_date=2025-01-01&end_date=2025-12-31');
    expect(supplierHref({ documento: '123.456.789-01', cnpj: null, cpf: '12345678901' })).toBeNull();
    expect(supplierHref({ documento: 'sem documento', cnpj: null, cpf: null })).toBeNull();
  });

  it.each([404, 401, 403, 503])('normaliza o status HTTP %i no detalhe', async (status) => {
    mock.onGet('/analytics/tce/empenhos/chave').reply(status, { error: { message: 'Falha', request_id: 'req-1' } });
    await expect(fetchCommitmentDetail('chave')).rejects.toMatchObject({ status, requestId: 'req-1' });
  });

  it('compartilha um único refresh entre chamadas simultâneas', async () => {
    const singleFlight = createSingleFlight<string, string>();
    let calls = 0;
    const refresh = () => singleFlight('session', async () => {
      calls += 1;
      await Promise.resolve();
      return 'novo-token';
    });
    await expect(Promise.all([refresh(), refresh(), refresh()])).resolves.toEqual(['novo-token', 'novo-token', 'novo-token']);
    expect(calls).toBe(1);
  });
});
