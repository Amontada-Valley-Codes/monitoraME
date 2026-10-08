import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { afterEach, describe, expect, it } from 'vitest';
import { getMunicipalOverview, MUNICIPAL_OVERVIEW_BFF_PATH, MUNICIPAL_OVERVIEW_PATH, toMunicipalOverviewApiParams } from './api';

const mock = new MockAdapter(axios);
afterEach(() => mock.reset());

describe('overview municipal', () => {
  it('mantem a grafia oficial do backend em uma unica constante', () => expect(MUNICIPAL_OVERVIEW_PATH).toBe('/analytics/tce/overview/munipal'));
  it('mapeia os nomes da URL para os parametros do backend', () => expect(toMunicipalOverviewApiParams({ start_date: '2025-01-01', end_date: '2025-12-31', municipality_tce_code: '010' })).toEqual({ data_inicial: '2025-01-01', data_final: '2025-12-31', codigo_municipio: '010' }));
  it('envia somente os tres parametros mapeados', async () => {
    mock.onGet(MUNICIPAL_OVERVIEW_BFF_PATH).reply((config) => {
      expect(config.params).toEqual({ data_inicial: '2025-01-01', data_final: '2025-12-31', codigo_municipio: '010' });
      expect(config.meta).toEqual({ allowOnboarding: true });
      return [200, { fonte: 'TCE' }];
    });
    await expect(getMunicipalOverview({ start_date: '2025-01-01', end_date: '2025-12-31', municipality_tce_code: '010' })).resolves.toMatchObject({ fonte: 'TCE' });
  });
});

