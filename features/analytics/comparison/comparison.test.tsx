import MockAdapter from 'axios-mock-adapter';
import { afterEach, describe, expect, it } from 'vitest';

import { commitmentsHttp } from '../commitments/api';
import { supplierOriginLabel } from '../commitments/detail-format';
import { fetchComparison } from './api';
import { buildComparisonRequest, comparisonExerciseFilters, comparisonLocationLabel, comparisonSideSummary, comparisonState, deriveComparisonMode, evolutionRows } from './model';
import type { ComparisonResponse, ComparisonSideDraft, ValueComparison } from './types';

const mock = new MockAdapter(commitmentsHttp);
afterEach(() => mock.reset());

function side(city: string, start = '2025-01-01', end = '2025-12-31'): ComparisonSideDraft {
  return { label: city === '2300754' ? 'Amontada 2025' : 'Sobral 2025', filters: { uf: 'CE', municipality_ibge_code: city, start_date: start, end_date: end, company_sizes: ['ME'], supplier_origins: [], expense_element_codes: ['30'] } };
}

const tie: ValueComparison = { ordering: 'TIE', left: { source: 'LEFT', label: 'Amontada 2025', value: 0 }, right: { source: 'RIGHT', label: 'Sobral 2025', value: 0 }, higher: null, lower: null, absolute_difference: 0, unit: 'CENTAVOS' };
const unavailable: ValueComparison = { ...tie, ordering: 'UNAVAILABLE', left: { ...tie.left, value: null }, right: { ...tie.right, value: null }, absolute_difference: null };

describe('comparação analítica', () => {
  it('deriva PERIODS, MUNICIPALITIES, MIXED e bloqueia recortes iguais', () => {
    expect(deriveComparisonMode(side('2300754'), side('2300754', '2024-01-01', '2024-12-31'))).toBe('PERIODS');
    expect(deriveComparisonMode(side('2300754'), side('2312908'))).toBe('MUNICIPALITIES');
    expect(deriveComparisonMode(side('2300754'), side('2312908', '2024-01-01', '2024-12-31'))).toBe('MIXED');
    expect(deriveComparisonMode(side('2300754'), side('2300754'))).toBeNull();
  });

  it('converte o exercício da comparação em período fechado', () => {
    expect(comparisonExerciseFilters('2024')).toEqual({
      start_date: '2024-01-01',
      end_date: '2024-12-31',
    });
    expect(comparisonExerciseFilters('inválido')).toEqual({
      start_date: '2025-01-01',
      end_date: '2025-12-31',
    });
  });

  it('envia somente o contrato JSON, com arrays e IBGE de sete dígitos, e aceita 200', async () => {
    const body = buildComparisonRequest(side('2300754'), side('2312908'))!;
    mock.onPost('/analytics/tce/comparisons').reply((config) => {
      const sent = JSON.parse(config.data);
      expect(sent).toEqual(body);
      expect(Object.keys(sent)).toEqual(['comparison_mode', 'left', 'right']);
      expect(sent.left.filters.municipality_ibge_code).toMatch(/^\d{7}$/);
      expect(sent.left.filters.company_sizes).toEqual(['ME']);
      expect(Array.isArray(sent.left.filters.supplier_origins)).toBe(true);
      return [200, { comparison_mode: 'MUNICIPALITIES' }];
    });
    await expect(fetchComparison(body)).resolves.toMatchObject({ comparison_mode: 'MUNICIPALITIES' });
  });

  it('preserva zero publicado e cria lacuna para competência não publicada ou sem par', () => {
    const rows = evolutionRows([
      { position: 1, left_period: '2025-01', right_period: '2024-01', left_published: true, right_published: false, compras_consideradas_centavos: { ...tie, left: { ...tie.left, value: 0 }, right: { ...tie.right, value: 999 } } },
      { position: 2, left_period: '2025-02', right_period: null, left_published: false, right_published: false, compras_consideradas_centavos: unavailable },
    ]);
    expect(rows[0]).toMatchObject({ left: 0, right: null });
    expect(rows[0].label).toBe('Jan/2025 × Jan/2024');
    expect(rows[1]).toMatchObject({ left: null, right: null });
    expect(comparisonState(unavailable)).toBe('unavailable');
  });

  it('prepara a fixture Amontada × Sobral e o empate de origem não identificada', () => {
    const overview = (label: string, name: string, code: string) => ({ label, filters: side(code).filters, overview: { status_exercicio: 'COMPLETO', municipio: { nome: name, uf: 'CE', codigo_ibge: code, codigo_tce: '010' }, competencias_solicitadas: [], competencias_publicadas: [], competencias_ausentes: [], falhas_competencias: [], totais_brutos: { empenhos: 2 }, totais_filtrados: { empenhos: 2 }, cobertura_cadastral: { empenhos: 2, empenhos_com_cache: 2, percentual: 100 }, kpis: {} } });
    const fixture: ComparisonResponse = { fonte: 'TCE', origem_dados: 'backend', consultas_externas: false, comparison_mode: 'MUNICIPALITIES', left: overview('Amontada 2025', 'Amontada', '2300754'), right: overview('Sobral 2025', 'Sobral', '2312908'), sections: { kpis: [{ indicator: 'total_compras_ME_centavos', ...tie }], participacao_por_porte_empresarial: [], elementos_despesa: [], evolucao_compras_consideradas: [], destino_recursos: [{ destino: 'ORIGEM_NAO_IDENTIFICADA', valor_centavos: tie, percentual: { ...tie, unit: 'PONTOS_PERCENTUAIS' } }] } };
    expect(fixture.left.overview.municipio?.nome).toBe('Amontada');
    expect(fixture.right.overview.municipio?.nome).toBe('Sobral');
    expect(comparisonState(fixture.sections.destino_recursos[0].valor_centavos)).toBe('tie');
    expect(supplierOriginLabel(fixture.sections.destino_recursos[0].destino)).toBe('Origem não identificada');
  });

  it('usa o rótulo do recorte quando o backend omite o município', () => {
    const sideWithoutMunicipality = {
      label: 'Amontada 2025',
      filters: side('2300754').filters,
      overview: {
        status_exercicio: 'COMPLETO',
        competencias_solicitadas: [],
        competencias_publicadas: [],
        competencias_ausentes: [],
        falhas_competencias: [],
        totais_brutos: { empenhos: 0 },
        totais_filtrados: { empenhos: 0 },
        cobertura_cadastral: { empenhos: 0, empenhos_com_cache: 0, percentual: 0 },
        kpis: {},
      },
    };

    expect(comparisonLocationLabel(sideWithoutMunicipality)).toBe('Amontada 2025 / CE');
  });

  it('resume o contrato real sem campos legados do overview', () => {
    const realPayloadSide = {
      label: 'Fortaleza 2025',
      filters: side('2304400').filters,
      overview: {
        kpis: {},
        base_analitica: { municipio_comprador: 'FORTALEZA' },
        competencias_solicitadas: ['2025-01', '2025-02'],
        competencias_publicadas: ['2025-01', '2025-02'],
        competencias_ausentes: [],
        falhas_competencias: [],
        totais_brutos: { empenhos: 27332 },
      },
    };

    expect(comparisonSideSummary(realPayloadSide)).toEqual({
      location: 'Fortaleza / CE',
      status: 'Dados publicados',
      commitments: 27332,
      coverageLabel: 'Competências publicadas',
      coverage: 100,
    });
  });

  it.each([422, 404, 503, 401, 403])('normaliza HTTP %i', async (status) => {
    const body = buildComparisonRequest(side('2300754'), side('2312908'))!;
    mock.onPost('/analytics/tce/comparisons').reply(status, { error: { message: 'Falha', request_id: 'req-comparison' } });
    await expect(fetchComparison(body)).rejects.toMatchObject({ status, requestId: 'req-comparison' });
  });
});
