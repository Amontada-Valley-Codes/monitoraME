import axios, { type AxiosRequestConfig } from 'axios';
import type { MunicipalOverview, MunicipalOverviewApiParams, MunicipalOverviewInput } from './types';
import { refreshSessionAcrossTabs } from '../../../shared/auth/refresh-lock';

declare module 'axios' {
  interface AxiosRequestConfig { meta?: { allowOnboarding?: boolean } }
}

export const MUNICIPAL_OVERVIEW_PATH = '/analytics/tce/overview/munipal'; // sic: grafia oficial do backend
export const MUNICIPAL_OVERVIEW_BFF_PATH = '/api/analytics/tce/overview/municipal';

export function toMunicipalOverviewApiParams(input: MunicipalOverviewInput): MunicipalOverviewApiParams {
  return { data_inicial: input.start_date, data_final: input.end_date, codigo_municipio: input.municipality_tce_code };
}

export class MunicipalOverviewError extends Error {
  constructor(public status: number, message: string, public requestId?: string) { super(message); this.name = 'MunicipalOverviewError'; }
}

export async function getMunicipalOverview(input: MunicipalOverviewInput, options: { signal?: AbortSignal } = {}): Promise<MunicipalOverview> {
  const config: AxiosRequestConfig = { params: toMunicipalOverviewApiParams(input), signal: options.signal, meta: { allowOnboarding: true }, headers: { Accept: 'application/json' } };
  try {
    let response;
    try {
      response = await axios.get<MunicipalOverview>(MUNICIPAL_OVERVIEW_BFF_PATH, config);
    } catch (error) {
      if (!axios.isAxiosError(error) || error.response?.status !== 401) throw error;
      try {
        await refreshSessionAcrossTabs();
      } catch {
        throw new MunicipalOverviewError(401, 'Sua sessão expirou.');
      }
      response = await axios.get<MunicipalOverview>(MUNICIPAL_OVERVIEW_BFF_PATH, config);
    }
    return response.data;
  } catch (error) {
    if (!axios.isAxiosError(error)) throw error;
    const body = error.response?.data as { error?: { message?: string; request_id?: string }; message?: string } | undefined;
    throw new MunicipalOverviewError(error.response?.status ?? 503, body?.error?.message ?? body?.message ?? 'Não foi possível carregar o panorama.', error.response?.headers?.['x-request-id'] ?? body?.error?.request_id);
  }
}

