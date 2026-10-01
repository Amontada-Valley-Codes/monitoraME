'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import type { PipelineOverviewParams } from './types';

export function useOverviewSelection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const rawYear = searchParams.get('ano') ?? String(currentYear);
  const year = /^\d{4}$/.test(rawYear) ? rawYear : String(currentYear);
  const rawMunicipality = searchParams.get('codigo_municipio');
  const municipality = rawMunicipality && /^\d{3}$/.test(rawMunicipality)
    ? rawMunicipality
    : undefined;

  const params = useMemo<PipelineOverviewParams>(() => ({
    data_inicial: `${year}-01-01`,
    data_final: `${year}-12-31`,
    ...(municipality ? { codigo_municipio: municipality } : {}),
  }), [year, municipality]);

  const update = useCallback((patch: { year?: string; municipality?: string }) => {
    const next = new URLSearchParams(searchParams.toString());
    if (patch.year) next.set('ano', patch.year);
    if (patch.municipality !== undefined) {
      if (/^\d{3}$/.test(patch.municipality)) {
        next.set('codigo_municipio', patch.municipality);
      } else {
        next.delete('codigo_municipio');
      }
    }
    router.replace(`${pathname}?${next}`, { scroll: false });
  }, [pathname, router, searchParams]);

  return { year, municipality, params, update };
}
