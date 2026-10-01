import 'server-only';

import { cache } from 'react';
import { cacheLife, cacheTag } from 'next/cache';

import { fetchPipelineOverview } from './service';
import type { PipelineOverviewParams, PipelineTceOverview } from './types';

const DEFAULT_CURRENT_SECONDS = 60 * 60;
const DEFAULT_CLOSED_SECONDS = 24 * 60 * 60;
const DEFAULT_PARTIAL_SECONDS = 5 * 60;

function secondsFromEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export const PIPELINE_CACHE_SECONDS = {
  current: secondsFromEnv(
    'PIPELINE_CACHE_CURRENT_SECONDS',
    DEFAULT_CURRENT_SECONDS,
  ),
  closed: secondsFromEnv(
    'PIPELINE_CACHE_CLOSED_SECONDS',
    DEFAULT_CLOSED_SECONDS,
  ),
  partial: secondsFromEnv(
    'PIPELINE_CACHE_PARTIAL_SECONDS',
    DEFAULT_PARTIAL_SECONDS,
  ),
} as const;

export const PIPELINE_OVERVIEW_TAG = 'pipeline-tce-overview';

export function overviewCacheTag(params: PipelineOverviewParams): string {
  const year = params.data_inicial.slice(0, 4);
  return `${PIPELINE_OVERVIEW_TAG}:${params.codigo_municipio ?? 'todos'}:${year}`;
}

function hasPartialData(data: PipelineTceOverview): boolean {
  return data.competencias_ausentes.length > 0 || data.falhas_competencias.length > 0;
}

async function readPersistentOverview(
  data_inicial: string,
  data_final: string,
  codigo_municipio?: string,
): Promise<PipelineTceOverview> {
  'use cache';

  const params = { data_inicial, data_final, codigo_municipio };
  const result = await fetchPipelineOverview(params);
  const isCurrentYear = Number(data_inicial.slice(0, 4)) === new Date().getFullYear();
  const revalidate = hasPartialData(result)
    ? PIPELINE_CACHE_SECONDS.partial
    : isCurrentYear
      ? PIPELINE_CACHE_SECONDS.current
      : PIPELINE_CACHE_SECONDS.closed;

  cacheLife({ revalidate, expire: revalidate * 2 });
  cacheTag(PIPELINE_OVERVIEW_TAG, overviewCacheTag(params));
  return result;
}

/**
 * Deduplicates equal reads in one render with React.cache; the inner Next cache
 * persists successful responses for 5 min (partial), 1 h (current), or 24 h
 * (closed). Invalidate with either tag exposed above.
 */
export const getPipelineOverview = cache(readPersistentOverview);
