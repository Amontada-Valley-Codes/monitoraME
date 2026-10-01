'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { MUNICIPALITIES } from '../data/fixtures';
import type { PipelineOverviewParams } from './types';
import { getTceMunicipality, TCE_MUNICIPALITIES } from './municipalities';

function normalizeMunicipalityName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

export function useOverviewSelection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();
  const rawStart = searchParams.get('start');
  const rawEnd = searchParams.get('end');
  const hasLegacyRange = Boolean(
    rawStart
    && rawEnd
    && /^\d{4}-\d{2}-\d{2}$/.test(rawStart)
    && /^\d{4}-\d{2}-\d{2}$/.test(rawEnd)
    && rawStart <= rawEnd,
  );
  const rawYear = searchParams.get('ano')
    ?? (hasLegacyRange ? rawStart?.slice(0, 4) : undefined)
    ?? String(currentYear);
  const year = /^\d{4}$/.test(rawYear) ? rawYear : String(currentYear);
  const rawMunicipality = searchParams.get('codigo_municipio');
  const legacyMunicipality = MUNICIPALITIES.find(
    (item) => item.id === searchParams.get('municipality'),
  );
  const legacyTceMunicipality = legacyMunicipality
    ? TCE_MUNICIPALITIES.find(
        (item) => normalizeMunicipalityName(item.name)
          === normalizeMunicipalityName(legacyMunicipality.name),
      )
    : undefined;
  const municipality = rawMunicipality && getTceMunicipality(rawMunicipality)
    ? rawMunicipality
    : legacyTceMunicipality?.code;

  const params = useMemo<PipelineOverviewParams>(() => ({
    data_inicial: hasLegacyRange && rawStart ? rawStart : `${year}-01-01`,
    data_final: hasLegacyRange && rawEnd ? rawEnd : `${year}-12-31`,
    ...(municipality ? { codigo_municipio: municipality } : {}),
  }), [hasLegacyRange, municipality, rawEnd, rawStart, year]);

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
