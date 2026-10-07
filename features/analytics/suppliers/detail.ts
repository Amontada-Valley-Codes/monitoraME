import type { SupplierMonthlyEvolution } from './types';

export type DisplayMonth = SupplierMonthlyEvolution & { semMovimento: boolean };

export function isValidSupplierRoute(type: string, document: string): type is 'CNPJ' | 'CPF' {
  if (type === 'CNPJ') return /^\d{14}$/.test(document);
  if (type === 'CPF') return /^\d{11}$/.test(document);
  return false;
}

export function fillMissingMonths(
  startDate: string,
  endDate: string,
  source: SupplierMonthlyEvolution[],
): DisplayMonth[] {
  const byMonth = new Map(source.map((item) => [item.competencia, item]));
  const start = /^(\d{4})-(\d{2})/.exec(startDate);
  const end = /^(\d{4})-(\d{2})/.exec(endDate);
  if (!start || !end) return source.map((item) => ({ ...item, semMovimento: false }));

  let year = Number(start[1]);
  let month = Number(start[2]);
  const endIndex = Number(end[1]) * 12 + Number(end[2]) - 1;
  const result: DisplayMonth[] = [];
  while (year * 12 + month - 1 <= endIndex) {
    const competencia = `${year}-${String(month).padStart(2, '0')}`;
    const original = byMonth.get(competencia);
    result.push(original
      ? { ...original, semMovimento: false }
      : {
          competencia,
          valor_empenhado_centavos: 0,
          valor_anulado_centavos: 0,
          valor_considerado_centavos: 0,
          quantidade_empenhos: 0,
          semMovimento: true,
        });
    month += 1;
    if (month === 13) { month = 1; year += 1; }
  }
  return result;
}

export function booleanLabel(value: boolean | null): string {
  return value === null ? 'Não informado' : value ? 'Sim' : 'Não';
}
