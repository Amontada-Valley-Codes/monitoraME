import { z } from 'zod';
import type { MunicipalOverviewInput } from './types';

function isRealCivilDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export const municipalOverviewInputSchema = z.object({
  start_date: z.string().refine(isRealCivilDate, 'Data inicial inválida.'),
  end_date: z.string().refine(isRealCivilDate, 'Data final inválida.'),
  municipality_tce_code: z.string().regex(/^\d{3}$/, 'Código de município inválido.'),
});

export function parseMunicipalOverviewInput(search: URLSearchParams): { value: MunicipalOverviewInput | null; complete: boolean; valid: boolean } {
  const raw = { start_date: search.get('start_date') ?? '', end_date: search.get('end_date') ?? '', municipality_tce_code: search.get('municipality_tce_code') ?? '' };
  const complete = Object.values(raw).every(Boolean);
  if (!complete) return { value: null, complete: false, valid: true };
  const parsed = municipalOverviewInputSchema.safeParse(raw);
  return { value: parsed.success ? parsed.data : null, complete: true, valid: parsed.success };
}

