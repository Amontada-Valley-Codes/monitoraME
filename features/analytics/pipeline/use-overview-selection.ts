'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { PipelineOverviewParams } from './types';

const DEFAULT_OVERVIEW_YEAR = '2025';

export function useOverviewSelection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const explicitYear = searchParams.get('ano');
  const hasExplicitYear = explicitYear !== null && /^\d{4}$/.test(explicitYear);
  const year = hasExplicitYear ? explicitYear : DEFAULT_OVERVIEW_YEAR;

  const params = useMemo<PipelineOverviewParams>(() => ({
    data_inicial: `${year}-01-01`,
    data_final: `${year}-12-31`,
  }), [year]);

  const update = useCallback((patch: { year?: string }) => {
    const next = new URLSearchParams(searchParams.toString());
    if (patch.year) {
      next.set('ano', patch.year);
    }
    next.delete('start');
    next.delete('end');
    next.delete('municipality');
    next.delete('codigo_municipio');
    router.replace(`${pathname}?${next}`, { scroll: false });
  }, [pathname, router, searchParams]);

  return { year, params, update };
}
