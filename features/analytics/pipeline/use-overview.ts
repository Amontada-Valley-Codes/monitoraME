'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

import { pipelineOverviewSchema, type PipelineOverviewParams, type PipelineTceOverview } from './types';
import { toOverviewViewModel } from './view-model';

type QueryStatus = 'loading' | 'ready' | 'error';

interface QuerySnapshot {
  status: QueryStatus;
  data: PipelineTceOverview | null;
  error: Error | null;
  expiresAt: number;
}

interface QueryEntry {
  snapshot: QuerySnapshot;
  promise: Promise<void> | null;
  listeners: Set<() => void>;
}

const queryCache = new Map<string, QueryEntry>();
const serverSnapshot: QuerySnapshot = {
  status: 'loading',
  data: null,
  error: null,
  expiresAt: 0,
};

function queryKey(params: PipelineOverviewParams): string {
  return [
    params.data_inicial,
    params.data_final,
    params.codigo_municipio ?? 'todos',
  ].join(':');
}

function getEntry(key: string): QueryEntry {
  const existing = queryCache.get(key);
  if (existing) return existing;
  const entry: QueryEntry = {
    snapshot: serverSnapshot,
    promise: null,
    listeners: new Set(),
  };
  queryCache.set(key, entry);
  return entry;
}

function publish(entry: QueryEntry, snapshot: QuerySnapshot) {
  entry.snapshot = snapshot;
  entry.listeners.forEach((listener) => listener());
}

async function requestOverview(
  key: string,
  params: PipelineOverviewParams,
  force = false,
): Promise<void> {
  const entry = getEntry(key);
  if (entry.promise) return entry.promise;
  if (!force && entry.snapshot.data && entry.snapshot.expiresAt > Date.now()) return;

  publish(entry, { ...entry.snapshot, status: 'loading', error: null });
  const search = new URLSearchParams({
    data_inicial: params.data_inicial,
    data_final: params.data_final,
  });
  if (params.codigo_municipio) {
    search.set('codigo_municipio', params.codigo_municipio);
  }

  entry.promise = fetch(`/api/pipeline/tce/overview?${search}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })
    .then(async (response) => {
      const body: unknown = await response.json();
      if (!response.ok) {
        const errorBody = body !== null && typeof body === 'object'
          ? body as Record<string, unknown>
          : {};
        const detail = errorBody.error !== null && typeof errorBody.error === 'object'
          ? errorBody.error as Record<string, unknown>
          : {};
        throw new Error(
          typeof detail.message === 'string'
            ? detail.message
            : 'Não foi possível carregar os dados solicitados.',
        );
      }

      const parsed = pipelineOverviewSchema.safeParse(body);
      if (!parsed.success) {
        throw new Error('Os dados recebidos não puderam ser exibidos.');
      }
      const staleSeconds = Number(response.headers.get('x-pipeline-stale-time'));
      publish(entry, {
        status: 'ready',
        data: parsed.data,
        error: null,
        expiresAt: Date.now() + (Number.isFinite(staleSeconds) ? staleSeconds : 300) * 1000,
      });
    })
    .catch((error: unknown) => {
      publish(entry, {
        status: 'error',
        data: null,
        error: error instanceof Error ? error : new Error('Falha desconhecida.'),
        expiresAt: 0,
      });
    })
    .finally(() => {
      entry.promise = null;
    });

  return entry.promise;
}

/** Shares one browser request for every component using the same exercise. */
export function usePipelineOverview(params: PipelineOverviewParams) {
  const key = queryKey(params);
  const entry = getEntry(key);
  const subscribe = useCallback((listener: () => void) => {
    entry.listeners.add(listener);
    return () => entry.listeners.delete(listener);
  }, [entry]);
  const getSnapshot = useCallback(() => entry.snapshot, [entry]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => serverSnapshot);

  useEffect(() => {
    void requestOverview(key, params);
  }, [key, params]);

  const retry = useCallback(() => {
    void requestOverview(key, params, true);
  }, [key, params]);

  const view = useMemo(
    () => snapshot.data ? toOverviewViewModel(snapshot.data) : null,
    [snapshot.data],
  );

  return { ...snapshot, view, retry };
}

export function useOverviewKpis(params: PipelineOverviewParams) {
  const query = usePipelineOverview(params);
  return { ...query, data: query.view?.kpis ?? null };
}

export function useOverviewBusinessSizes(params: PipelineOverviewParams) {
  const query = usePipelineOverview(params);
  return { ...query, data: query.view?.businessSizes ?? null };
}

export function useOverviewExpenseElements(params: PipelineOverviewParams) {
  const query = usePipelineOverview(params);
  return { ...query, data: query.view?.expenseElements ?? null };
}

export function useOverviewMonthlyEvolution(params: PipelineOverviewParams) {
  const query = usePipelineOverview(params);
  return { ...query, data: query.view?.monthly ?? null };
}

export function useOverviewDestinations(params: PipelineOverviewParams) {
  const query = usePipelineOverview(params);
  return { ...query, data: query.view?.destinations ?? null };
}
