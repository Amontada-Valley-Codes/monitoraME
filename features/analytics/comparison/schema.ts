import { z } from 'zod';

function validCivilDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1])
    && date.getUTCMonth() === Number(match[2]) - 1
    && date.getUTCDate() === Number(match[3]);
}

const sideSchema = z.object({
  label: z.string().trim().min(1).max(120),
  filters: z.object({
    uf: z.literal('CE'),
    municipality_ibge_code: z.string().regex(/^\d{7}$/),
    start_date: z.string().refine(validCivilDate),
    end_date: z.string().refine(validCivilDate),
    company_sizes: z.array(z.enum(['ME', 'MEI', 'EPP', 'OTHER', 'UNKNOWN'])),
    supplier_origins: z.array(z.enum(['NO_MUNICIPIO_COMPRADOR', 'EM_OUTRO_MUNICIPIO', 'FORA_DO_CEARA', 'ORIGEM_NAO_IDENTIFICADA'])),
    expense_element_codes: z.array(z.enum(['30', '32', '35', '39', '40', '51', '52'])),
  }),
});

export const comparisonRequestSchema = z.object({
  comparison_mode: z.enum(['PERIODS', 'MUNICIPALITIES', 'MIXED']),
  left: sideSchema,
  right: sideSchema,
});
