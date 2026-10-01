'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  startTransition,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { useAnalyticsWebMCP } from '@/shared/lib/analytics-webmcp';
import {
  DEFAULT_FILTERS,
  CATEGORIES,
  MUNICIPALITIES,
  ORIGINS,
  SIZES,
} from './fixtures';
import { mockAnalyticsRepository, type AnalyticsResult } from './repository';
import type { Filters, LoadState } from './types';

export function encodeFilters(filters: Filters): string {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    query.set(key, Array.isArray(value) ? value.join(',') : value);
  });
  return query.toString();
}

export function parseFilters(query: URLSearchParams): Filters {
  const filters: Filters = { ...DEFAULT_FILTERS };

  for (const key of ['uf', 'municipality', 'start', 'end', 'size', 'origin'] as const) {
    const value = query.get(key);
    if (value) filters[key] = value;
  }

  if (query.has('categories')) {
    filters.categories = (query.get('categories') ?? '')
      .split(',')
      .filter((id) => CATEGORIES.some((category) => category.id === id));
  }

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(filters.start) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(filters.end) ||
    filters.start > filters.end
  ) {
    filters.start = DEFAULT_FILTERS.start;
    filters.end = DEFAULT_FILTERS.end;
  }

  if (
    filters.municipality !== 'all' &&
    !MUNICIPALITIES.some((m) => m.id === filters.municipality)
  ) {
    filters.municipality = 'all';
  }

  if (filters.size !== 'all' && !SIZES.some((size) => size.id === filters.size)) {
    filters.size = 'all';
  }

  if (filters.origin !== 'all' && !ORIGINS.some((origin) => origin.id === filters.origin)) {
    filters.origin = 'all';
  }

  return filters;
}

type Context = {
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  reset: () => void;
  data: AnalyticsResult | null;
  state: LoadState;
  reload: () => void;
  navigate: (path: string, patch?: Partial<Filters>) => void;
};

const AnalyticsContext = createContext<Context | null>(null);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [localFilters, setLocalFilters] = useState<Filters>(DEFAULT_FILTERS);
  useEffect(() => {
    if (searchParams.has('start')) return;

    try {
      const saved = localStorage.getItem('monitorame.filters.v1');
      if (saved) {
        const savedFilters = parseFilters(new URLSearchParams(saved));
        startTransition(() => setLocalFilters(savedFilters));
      }
    } catch {
      // Keep the default filters if localStorage access fails
    }
  }, [searchParams]);
  const filters = searchParams.has('start')
    ? parseFilters(new URLSearchParams(searchParams.toString()))
    : localFilters;
  const [ready] = useState<boolean>(true);
  const [data, setData] = useState<AnalyticsResult | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [version, setVersion] = useState<number>(0);

  // Update filters, update URL search params, and persist in localStorage
  const setFilters = useCallback(
    (patch: Partial<Filters>) => {
      const updatedFilters = { ...filters, ...patch };
      setLocalFilters(updatedFilters);

      try {
        localStorage.setItem('monitorame.filters.v1', encodeFilters(updatedFilters));
      } catch {
        toast.error('Não foi possível guardar a preferência neste navegador.');
      }

      router.replace(`${pathname}?${encodeFilters(updatedFilters)}`, { scroll: false });
    },
    [router, pathname, filters]
  );

  // Fetch analytics data when filters, ready status, or version changes
  useEffect(() => {
    if (!ready) return;

    const controller = new AbortController();

    mockAnalyticsRepository
      .query(filters, controller.signal)
      .then((result) => {
        if (new URLSearchParams(window.location.search).get('estado') === 'erro') {
          throw new Error('Simulação de erro');
        }
        setData(result);
        setState('ready');
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setState('error');
        }
      });

    return () => controller.abort();
  }, [filters, ready, version]);

  useAnalyticsWebMCP(filters, data, state);

  const navigate = useCallback(
    (path: string, patch?: Partial<Filters>) => {
      router.push(`${path}?${encodeFilters({ ...filters, ...patch })}`);
    },
    [router, filters]
  );

  const reload = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('estado');
    window.history.replaceState(null, '', `${pathname}?${params}`);
    setVersion((prevVersion) => prevVersion + 1);
  };

  return (
    <AnalyticsContext.Provider
      value={{
        filters,
        setFilters,
        reset: () => setFilters(DEFAULT_FILTERS),
        data,
        state,
        reload,
        navigate,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('AnalyticsProvider ausente');
  }
  return context;
};
