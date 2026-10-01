import 'server-only';

import axios, { AxiosError } from 'axios';

const DEFAULT_PIPELINE_URL = 'http://127.0.0.1:8000';
const DEFAULT_TIMEOUT_MS = 120_000;

export type PipelineApiErrorKind = 'timeout' | 'network' | 'http';

export class PipelineApiError extends Error {
  constructor(
    message: string,
    public readonly kind: PipelineApiErrorKind,
    public readonly status?: number,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'PipelineApiError';
  }
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const pipelineApi = axios.create({
  baseURL: process.env.PIPELINE_API_URL ?? DEFAULT_PIPELINE_URL,
  timeout: positiveInteger(process.env.PIPELINE_API_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  headers: { Accept: 'application/json' },
});

pipelineApi.interceptors.request.use((config) => {
  const token = process.env.PIPELINE_API_KEY;
  if (token) {
    config.headers.set(
      process.env.PIPELINE_API_KEY_HEADER ?? 'x-api-key',
      token,
    );
  }
  return config;
});

pipelineApi.interceptors.response.use(undefined, (error: unknown) => {
  if (!axios.isAxiosError(error)) return Promise.reject(error);

  const axiosError = error as AxiosError;
  if (axiosError.code === AxiosError.ETIMEDOUT || axiosError.code === 'ECONNABORTED') {
    return Promise.reject(
      new PipelineApiError(
        'O pipeline excedeu o tempo limite da consulta.',
        'timeout',
        undefined,
        { cause: error },
      ),
    );
  }

  if (!axiosError.response) {
    return Promise.reject(
      new PipelineApiError(
        'Não foi possível conectar ao serviço de pipeline.',
        'network',
        undefined,
        { cause: error },
      ),
    );
  }

  return Promise.reject(
    new PipelineApiError(
      `O pipeline respondeu com HTTP ${axiosError.response.status}.`,
      'http',
      axiosError.response.status,
      { cause: error },
    ),
  );
});
